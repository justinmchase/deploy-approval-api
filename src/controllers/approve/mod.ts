import {
  Application,
  Controller,
  Request,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";

export class ApproveController implements Controller<Context, State> {
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/approve/{approvalGroupId}",
      async (context, _next) => {
        console.log({
          a: context.captures,
          b: context.matched,
          c: context.params,
        });
        await this.approve(context.request, context.response);
      },
    );
    router.get(
      "/reject/{approvalGroupId}",
      async (context, _next) =>
        await this.reject(context.request, context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async approve(_req: Request, res: Response) {
    res.status = Status.OK;
    res.body = { ok: true, state: "approved" };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }

  private async reject(_req: Request, res: Response) {
    res.status = Status.OK;
    res.body = { ok: true, state: "rejected" };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
