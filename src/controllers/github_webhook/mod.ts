import { GithubWebhookController } from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { GitHubPingEvent } from "https://deno.land/x/github_api@0.4.6/src/types/ping.ts";
import { ILogger } from "https://deno.land/x/grove@0.5.0-pre.3/src/logging/logger.interface.ts";
import { Response } from "https://deno.land/x/grove@0.5.0-pre.3/src/mod.ts";

export class DeployApprovalWebhookController
  extends GithubWebhookController<Context, State> {

    protected override async handlePingEvent(log: ILogger, _res: Response, _event: GitHubPingEvent): Promise<void> {
        await log.debug("testing", "its working...");
    }
}
