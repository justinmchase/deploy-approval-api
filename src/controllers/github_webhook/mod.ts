import { GithubWebhookController, ILogger, Response } from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { GitHubInstallationEvent, GitHubPingEvent } from "github_api/mod.ts";

export class DeployApprovalWebhookController
  extends GithubWebhookController<Context, State> {
  protected override async handlePingEvent(
    log: ILogger,
    res: Response,
    event: GitHubPingEvent,
  ): Promise<void> {
    await log.debug("testing_ping", "its working...");
    super.handlePingEvent(log, res, event);
  }

  protected override async handleInstallationEvent(
    log: ILogger,
    res: Response,
    event: GitHubInstallationEvent,
  ): Promise<void> {
    await log.debug("testing_installation", "its working...");
    super.handleInstallationEvent(log, res, event);
  }
}
