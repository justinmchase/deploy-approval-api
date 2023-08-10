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
      (context, _next) => this.home(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private home(res: Response) {
    res.status = Status.OK;
    res.body = { ok: true };
    res.headers.set("Content-Type", "application/javascript");
  }
}
