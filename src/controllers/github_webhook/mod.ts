import { basename } from "std/path/mod.ts";
import {
  github_api,
  GithubWebhookController,
  ILogger,
  Response,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import * as YAML from "std/yaml/mod.ts";
import { SerializableRecord } from "https://deno.land/x/serializable@0.3.4/mod.ts";

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
      const { id: workflowId, path } = approvalWorkflow;
      const inputs = await this.getWorkflowInput(
        client,
        path,
        repository,
      );
      await github_api.api.repos.actions.workflows.dispatches.create({
        client,
        ref,
        repository,
        workflowId,
        inputs,
      });
      log.info(
        "approval_workflow_dispatched",
        `approval workflow ${workflowId} invoked for ${repository.full_name}`,
        {
          ref,
          repository: { full_name: repository.full_name },
          workflowId,
          path,
        },
      );
    }

    await super.handleDeploymentProtectionRuleEvent(log, res, event);
  }

  private async getWorkflowInput(
    client: github_api.GitHubClient,
    path: string,
    repository: github_api.GitHubRepository,
  ) {
    const contents = await github_api.api.repos.contents.get({
      client,
      path,
      repository,
    }) as github_api.GitHubFileContent;
    const yaml = atob(contents.content);

    // deno-lint-ignore no-explicit-any
    const workflow = YAML.parse(yaml) as any;
    console.log({ workflow });
    for (
      const [k, v] of Object.entries(
        workflow?.on?.workflow_dispatch?.inputs ?? {},
      )
    ) {
      console.log({ k, v });
    }

    return {};
  }
}
