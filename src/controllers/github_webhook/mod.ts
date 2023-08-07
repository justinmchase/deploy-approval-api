import { basename } from "std/path/mod.ts";
import {
  github_api,
  GithubWebhookController,
  ILogger,
  Response,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";

export class DeployApprovalWebhookController
  extends GithubWebhookController<Context, State> {
  protected override async handleDeploymentProtectionRuleEvent(
    log: ILogger,
    res: Response,
    event: github_api.GitHubDeploymentProtectionRuleEvent,
  ): Promise<void> {
    const {
      deployment: { ref },
      installation: { id: installationId },
      repository,
    } = event;
    await log.debug("custom logic...", "goes here...");
    const client = await this.github.client(installationId);
    const workflows = await github_api.api.repos.actions.workflows.list({
      client,
      repository,
    });
    const approvalWorkflow = workflows.find((w) =>
      basename(w.path) === "approval.yml"
    );
    if (!approvalWorkflow || approvalWorkflow.state !== "active") {
      log.info(
        "approval_workflow_not_available",
        "approval workflow is not available",
        {
          approvalWorkflow,
        },
      );
    } else {
      const { id: workflowId,  } = approvalWorkflow;
      await github_api.api.repos.actions.workflows.dispatches.create({
        client,
        ref,
        repository,
        workflowId,
        inputs: {},
      });
      log.info(
        "approval_workflow_dispatched",
        `approval workflow ${workflowId} invoked for ${repository.full_name}`,
        {
          ref,
          repository: { full_name: repository.full_name },
          workflowId,
          approvalWorkflow
        },
      );
    }

    await super.handleDeploymentProtectionRuleEvent(log, res, event);
  }
}
