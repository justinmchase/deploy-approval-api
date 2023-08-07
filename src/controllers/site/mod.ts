import {
  Application,
  Controller,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";

export class SiteController implements Controller<Context, State> {
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/",
      async (context, _next) => await this.handler(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(res: Response) {
    res.status = Status.OK;
    res.body = { ok: true };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
