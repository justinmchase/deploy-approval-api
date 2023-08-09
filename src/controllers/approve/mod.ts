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
      "/approve/:approvalGroupId",
      async (context, _next) =>
        await this.approve(context.params.approvalGroupId, context.response),
    );
    router.get(
      "/reject/:approvalGroupId",
      async (context, _next) =>
        await this.reject(context.params.approvalGroupId, context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async approve(approvalGroupId: string, res: Response) {
    res.status = Status.OK;
    res.body = { ok: true, state: "approved" };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }

  private async reject(approvalGroupId: string, res: Response) {
    res.status = Status.OK;
    res.body = { ok: true, state: "rejected" };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
