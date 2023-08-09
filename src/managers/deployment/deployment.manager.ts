import { github_api as gh } from "grove/mod.ts";
import { DeploymentRepository } from "../../repositories/deployments/mod.ts";
import { DeploymentScope } from "./deployment.scope.ts";
import {
  ApprovalGroupRepository,
  ApprovalRepository,
} from "../../repositories/mod.ts";

export class DeploymentManager {
  constructor(
    private readonly deployments: DeploymentRepository,
    private readonly approvalGroups: ApprovalGroupRepository,
    private readonly approvals: ApprovalRepository,
  ) {}

  public async createDeploymentApprovals(
    client: gh.GitHubClient,
    repository: gh.GitHubRepository,
    deployment: gh.GitHubDeployment,
    workflow: gh.GitHubWorkflow,
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
      runId,
    );
    await scope.createDeployment();
  }
}
