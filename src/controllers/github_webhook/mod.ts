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
    await log.debug("custom logic...", "goes here...");
    await super.handleDeploymentProtectionRuleEvent(log, res, event);
  }
}
