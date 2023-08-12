import { basename } from "std/path/mod.ts";
import {
  github_api as gh,
  GitHubService,
  GithubWebhookController,
  IGitHubWebhookConfig,
  ILogger,
  NotFoundError,
  Response,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { DeploymentManager } from "../../managers/deployment/mod.ts";

export class DeployApprovalWebhookController
  extends GithubWebhookController<Context, State> {
  constructor(
    config: IGitHubWebhookConfig,
    github: GitHubService,
    private readonly deployments: DeploymentManager,
  ) {
    super(config, github);
  }

  protected override async handleDeploymentProtectionRuleEvent(
    log: ILogger,
    res: Response,
    event: gh.GitHubDeploymentProtectionRuleEvent,
  ): Promise<void> {
    const {
      deployment_callback_url,
      deployment,
      installation: { id: installationId },
      repository,
    } = event;
    // For some reason the run isn't included in the payload, the only way
    // to get the runId is to get it out of the callback url.
    const runId = parseInt(
      new URL(deployment_callback_url).pathname.split("/")[6],
    );
    const client = await this.github.client(installationId);
    const workflow = await this.getApprovalWorkflow(client, repository);
    await this.deployments.createDeploymentApprovals(
      client,
      repository,
      deployment,
      workflow,
      installationId,
      runId,
    );
    await super.handleDeploymentProtectionRuleEvent(log, res, event);
  }

  private async getApprovalWorkflow(
    client: gh.GitHubClient,
    repository: gh.GitHubRepository,
  ) {
    const workflows = await gh.api.repos.actions.workflows.list({
      client,
      repository,
    });
    const approvalWorkflow = workflows.find((w) =>
      basename(w.path) === "approval.yml"
    );
    if (!approvalWorkflow || approvalWorkflow.state !== "active") {
      throw new NotFoundError("GitHubWorkflow", "approval.yml");
    }
    return approvalWorkflow;
  }
}
