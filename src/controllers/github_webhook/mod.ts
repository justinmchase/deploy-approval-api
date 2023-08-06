import {
  Application,
  Controller,
  Request,
  Response,
  Router,
  Status,
  ILogger,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { ConfigService } from "../../services/mod.ts";
import { GithubService } from "../../services/github/mod.ts";

export class GithubWebhookController implements Controller<Context, State> {

  private readonly githubWebhookPath: string
  constructor(
    config: ConfigService,
    private readonly github: GithubService,
  ) {
    this.githubWebhookPath = config.githubWebhookPath;
  }
      
  public async use(app: Application<State>): Promise<void> {
    const router = new Router<State>();
    router.post(
      this.githubWebhookPath,
      async (context, _next) =>
        await this.handler(context.state.context.log, context.request, context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(log: ILogger, req: Request, res: Response) {
    const githubEvent = req.headers.get("X-GitHub-Event");
    await this.github.verify(req);
    const body = await req.body({ type: "json" }).value;
    res.status = Status.OK;
    res.body = {
      ok: true,
    };
    log.info(
      "github_webhook",
      `github event ${githubEvent}`,
      {
        githubEvent,
        body,
      }
    )
  }
}
