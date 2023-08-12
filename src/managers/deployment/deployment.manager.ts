import { gh, mongo } from "grove";
import { DeploymentRepository } from "../../repositories/deployments/mod.ts";
import { DeploymentScope } from "./deployment.scope.ts";
import {
  ApprovalGroupRepository,
  ApprovalRepository,
} from "../../repositories/mod.ts";
import { IDeployment } from "../../models/deployment.model.ts";
import { ApprovalState } from "../../models/approval.model.ts";

export class DeploymentManager {
  constructor(
    private readonly deployments: DeploymentRepository,
    private readonly approvalGroups: ApprovalGroupRepository,
    private readonly approvals: ApprovalRepository,
  ) {}

  public async get(deploymentId: mongo.ObjectId) {
    return await this.deployments.get(deploymentId);
  }

  public async createDeploymentApprovals(
    client: gh.GitHubClient,
    repository: gh.GitHubRepository,
    deployment: gh.GitHubDeployment,
    workflow: gh.GitHubWorkflow,
    installationId: number,
    runId: number,
  ) {
    const scope = new DeploymentScope(
      client,
      repository,
      deployment,
      workflow,
      this.deployments,
      this.approvalGroups,
      this.approvals,
      installationId,
      runId,
    );
    const created = await scope.createDeployment();
    const { state } = await this.check(created);
    if (state) {
      await this.approve(client, created, state);
    }
  }

  public async check(deployment: IDeployment) {
    return await this.deployments.check(deployment);
  }
  
  public async approve(client: gh.GitHubClient, deployment: IDeployment, approvalState: ApprovalState) {
    const { runId, environment, repository } = deployment;
    const [owner, repo] = repository.split("/");
    await gh.api.repos.actions.runs.deployment_protection_rule.create({
      client,
      repository: {
        full_name: repository,
        name: repo,
        owner: { login: owner },
      } as gh.GitHubRepository,
      runId,
      environmentName: environment,
      state: approvalState,
      comment: `[${approvalState === "approved"
        ? "Deployment Approved"
        : "Deployment Rejected"
      }](https://deploy-approval.app/deployment/${deployment._id})`
    });
    await this.deployments.approve(deployment, approvalState);
  }
}
