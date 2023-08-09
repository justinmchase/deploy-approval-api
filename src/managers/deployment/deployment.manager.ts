import { github_api as gh, mongo } from "grove/mod.ts";
import { DeploymentRepository } from "../../repositories/deployments/mod.ts";
import { DeploymentScope } from "./deployment.scope.ts";
import {
  ApprovalGroupRepository,
  ApprovalRepository,
} from "../../repositories/mod.ts";
import { IDeployment } from "../../models/deployment.model.ts";

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
    await this.check(client, created);
  }

  public async check(
    client: gh.GitHubClient,
    deployment: IDeployment,
  ) {
    const { runId, environment, repository } = deployment;
    const [owner, repo] = repository.split("/");
    const { state, comment } = await this.deployments.check(deployment);
    if (state) {
      await gh.api.repos.actions.runs.deployment_protection_rule.create({
        client,
        repository: {
          full_name: repository,
          name: repo,
          owner: { login: owner },
        } as gh.GitHubRepository,
        runId,
        environmentName: environment,
        state,
        comment: comment ?? state === "approved"
          ? "Deployment Approved"
          : "Deployment Rejected",
      });
    }
  }
}
