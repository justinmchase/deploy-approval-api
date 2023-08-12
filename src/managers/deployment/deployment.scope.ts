import * as YAML from "std/yaml/mod.ts";
import { github_api as gh } from "grove/mod.ts";
import {
  ApprovalRepository,
  DeploymentRepository,
} from "../../repositories/mod.ts";
import { SerializableRecord } from "serializable";
import { ApprovalConfigSchema, ApprovalGroupConfig } from "../../models/mod.ts";
import { IDeployment } from "../../models/mod.ts";
import { ApprovalGroupRepository } from "../../repositories/approval_groups/mod.ts";

export class DeploymentScope {
  constructor(
    private readonly client: gh.GitHubClient,
    private readonly repository: gh.GitHubRepository,
    private readonly deployment: gh.GitHubDeployment,
    private readonly workflow: gh.GitHubWorkflow,
    private readonly deployments: DeploymentRepository,
    private readonly approvalGroups: ApprovalGroupRepository,
    private readonly approvals: ApprovalRepository,
    private readonly installationId: number,
    private readonly runId: number,
  ) {}

  public async createDeployment() {
    const deployment = await this.deployments.upsert({
      deployment: this.deployment,
      repository: this.repository,
      installationId: this.installationId,
      runId: this.runId,
    });
    const { environment } = this.deployment;
    const approvalConfig = await this.getApprovalConfig();
    const groups = approvalConfig.environments[environment].groups ?? [];
    if (groups.length) {
      for (const groupId of groups) {
        const { name } = approvalConfig.groups.find(({ id }) =>
          id === groupId
        ) ?? {};
        await this.createApprovalGroup(deployment, {
          id: groupId,
          name: name ?? groupId,
        });
      }
    } else {
      // Creates a default group and automatically approves it.
      await this.createDefaultApprovalGroup(deployment);
    }
    return deployment;
  }

  private async createApprovalGroup(
    deployment: IDeployment,
    group: ApprovalGroupConfig,
  ) {
    const approvalGroup = await this.approvalGroups.upsert({
      deployment,
      group,
    });
    await gh.api.repos.actions.workflows.dispatches.create({
      client: this.client,
      repository: this.repository,
      ref: this.deployment.ref,
      workflowId: this.workflow.id,
      inputs: {
        "environment": this.deployment.environment,
        "group-id": group.id,
        "group-name": group.name,
        "approval-url":
          `http://deploy-approval.app/approval/${approvalGroup._id}`,
      },
    });
  }

  private async createDefaultApprovalGroup(deployment: IDeployment) {
    const approvalGroup = await this.approvalGroups.upsert({
      deployment,
      group: {
        id: "default",
        name: "Default Group",
      },
    });
    await this.approvals.create(
      approvalGroup,
      "approved",
      "No approval groups configured. Auto-approved.",
    );
  }

  private async getApprovalConfig() {
    const approvalConfig = await this.getContent(".github/approval.yml");
    return ApprovalConfigSchema.parse(approvalConfig);
  }

  private async getContent(path: string) {
    const { client, repository } = this;
    const contents = await gh.api.repos.contents.get({
      client,
      repository,
      path,
    }) as gh.GitHubFileContent;
    const yaml = atob(contents.content);
    return YAML.parse(yaml) as SerializableRecord;
  }
}
