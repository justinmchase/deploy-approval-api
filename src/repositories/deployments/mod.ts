import { mongo, MongoService, NotFoundError } from "grove/mod.ts";
import { github_api as gh } from "grove/mod.ts";
import { IDeployment } from "../../models/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";

export type UpsertDeployment = {
  repository: gh.GitHubRepository;
  deployment: gh.GitHubDeployment;
  installationId: number;
  runId: number;
};

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
    const { id: deploymentId, environment, ref } = deployment;
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
  ): Promise<{ state?: ApprovalState; comment?: string }> {
    const { _id: deploymentId } = deployment;
    type ResultType = {
      deploymentId: mongo.ObjectId;
      approvalGroupId: mongo.ObjectId;
      groupId: string;
      groupName: string;
      state: ApprovalState | null;
    };
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
          groupId: {
            $first: "$approvalGroup.id",
          },
          groupName: {
            $first: "$approvalGroup.name",
          },
          state: {
            $first: "$approvalGroup.approval.state",
          },
        },
      },
    ]).toArray();

    // one or more of the approval groups have not been approved or rejected yet
    const notApproved = results.find((r) => r.state === null);
    if (notApproved) {
      return {};
    }

    // If one or more groups are rejected
    const rejected = results.filter((r) => r.state === "rejected");
    if (rejected.length) {
      return {
        state: "rejected",
        comment: rejected.map((rejection) =>
          `* \`${rejection.groupName}\` was **rejected**`
        ).join("\n"),
      };
    }

    // All groups are approved
    return {
      state: "approved",
      comment: results.map((r) => `* \`${r.groupName}\` was \`approved\``).join(
        "\n",
      ),
    };
  }
}
