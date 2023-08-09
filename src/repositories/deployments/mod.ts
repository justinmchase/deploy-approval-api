import { MongoService, NotFoundError, mongo } from "grove/mod.ts";
import { github_api as gh } from "grove/mod.ts";
import { IDeployment } from "../../models/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";

export type UpsertDeployment = {
  repository: gh.GitHubRepository,
  deployment: gh.GitHubDeployment,
  runId: number
}

export class DeploymentRepository {
  private readonly deployments: mongo.Collection<IDeployment>;
  constructor(mongo: MongoService) {
    this.deployments = mongo.collection<IDeployment>("deployments");
  }

  public async upsert(info: UpsertDeployment) {
    const { repository, deployment, runId } = info;
    const { full_name } = repository;
    const { id: deploymentId, environment, ref } = deployment;
    const upserted = await this.deployments.findAndModify(
      {
        deploymentId
      },
      {
        upsert: true,
        update: {
          $setOnInsert: {
            repository: full_name,
            deploymentId,
            environment,
            ref,
            createdAt: new Date()
          },
          $set: {
            runId,
            updatedAt: new Date()
          }
        }
      }
    )
    if (!upserted) {
      throw new NotFoundError("IDeployment", `${deploymentId}`)
    }
    return upserted;
  }

  public async checkState(_deployment: IDeployment): Promise<{ state?: ApprovalState, comment?: string }> {
    // await this.deployments.aggregate([

    // ])

    return await {}
  }
}