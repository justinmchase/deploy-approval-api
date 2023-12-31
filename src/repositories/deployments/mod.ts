import { gh, mongo, MongoService, NotFoundError } from "grove";
import { IDeployment, User } from "../../models/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";
import { PageArgs } from "../../models/page.ts";

export type UpsertDeployment = {
  repository: gh.GitHubRepository;
  deployment: gh.GitHubDeployment;
  installationId: number;
  runId: number;
};

export type ResultType = {
  deploymentId: mongo.ObjectId;
  approvalGroupId: mongo.ObjectId;
  approvalAt: Date;
  groupId: string;
  groupName: string;
  state: ApprovalState | null;
  count: number;
};

export type ApprovalCheck = { state?: ApprovalState; results: ResultType[] }

export class DeploymentRepository {
  private readonly deployments: mongo.Collection<IDeployment>;
  constructor(mongo: MongoService) {
    this.deployments = mongo.collection<IDeployment>("deployments");
  }

  public async get(deploymentId: mongo.ObjectId) {
    const deployment = await this.deployments.findOne({ _id: deploymentId });
    if (!deployment) {
      throw new NotFoundError("IDeployment", deploymentId.toHexString());
    }
    return deployment;
  }

  public async upsert(info: UpsertDeployment) {
    const { repository, deployment, installationId, runId } = info;
    const { full_name } = repository;
    const { id: deploymentId, environment, ref, creator: { avatar_url, login, url } } = deployment;
    const upserted = await this.deployments.findAndModify(
      {
        deploymentId,
      },
      {
        upsert: true,
        new: true,
        update: {
          $setOnInsert: {
            repository: full_name,
            deploymentId,
            installationId,
            environment,
            ref,
            creator: {
              login,
              url,
              avatarUrl: avatar_url
            },
            createdAt: new Date(),
          },
          $set: {
            runId,
            updatedAt: new Date(),
          },
        },
      },
    );
    if (!upserted) {
      throw new NotFoundError("IDeployment", `${deploymentId}`);
    }
    return upserted;
  }

  public async check(
    deployment: IDeployment,
  ): Promise<ApprovalCheck> {
    const { _id: deploymentId } = deployment;
    const results = await this.deployments.aggregate<ResultType>([
      {
        $match: {
          _id: deploymentId,
        },
      },
      {
        $lookup: {
          from: "approvalGroups",
          localField: "_id",
          foreignField: "deploymentId",
          as: "approvalGroup",
        },
      },
      {
        $unwind: {
          path: "$approvalGroup",
        },
      },
      {
        $lookup: {
          from: "approvals",
          localField: "approvalGroup._id",
          foreignField: "approvalGroupId",
          as: "approvalGroup.approval",
        },
      },
      {
        $unwind: {
          path: "$approvalGroup.approval",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: [
            "$approvalGroup.approval.state",
            "$approvalGroup._id",
          ],
          deploymentId: {
            $first: "$_id",
          },
          approvalGroupId: {
            $first: "$approvalGroup._id",
          },
          approvalAt: {
            $max: "$createdAt"
          },
          groupId: {
            $first: "$approvalGroup.id",
          },
          groupName: {
            $first: "$approvalGroup.name",
          },
          state: {
            $first: "$approvalGroup.approval.state",
          },
          count: {
            $sum: 1
          }
        },
      },
    ]).toArray();

    // one or more of the approval groups have not been approved or rejected yet
    const notApproved = results.find((r) => r.state === null);
    if (notApproved) {
      return {
        state: undefined,
        results
      };
    }

    // If one or more groups are rejected
    const rejected = results.filter((r) => r.state === "rejected");
    if (rejected.length) {
      return {
        state: "rejected",
        results
      };
    }

    // All groups are approved
    return {
      state: "approved",
      results,
    };
  }

  
  public async approve(deployment: IDeployment, approvalState: ApprovalState) {
    const { _id } = deployment;
    const now = new Date();
    await this.deployments.updateOne(
      { _id },
      {
        $set: {
          state: approvalState,
          updatedAt: now,
        }
      }
    );
    return {
      ...deployment,
      state: approvalState,
      updated: now,
    }
  }

}
