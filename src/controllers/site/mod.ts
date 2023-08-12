import {
  oak,
  Controller,
} from "grove";
import { Context, State } from "../../context.ts";

export class SiteController implements Controller<Context, State> {
  public async use(app: oak.Application<State>): Promise<void> {
    const router = new oak.Router();
    router.get(
      "/",
      (context) => this.home(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }
  private home(res: oak.Response) {
    res.status = oak.Status.OK;
    res.body = { ok: true };
    res.headers.set("Content-Type", "application/javascript");
  }
}
