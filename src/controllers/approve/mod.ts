import {
  Application,
  Controller,
  mongo,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { ApprovalGroupManager, DeploymentManager } from "../../managers/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";

export class ApproveController implements Controller<Context, State> {
  constructor(
    private readonly deployments: DeploymentManager,
    private readonly approvalGroups: ApprovalGroupManager,
  ) {
  }
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/approve/:approvalGroupId",
      async (context, _next) =>
        await this.approve(
          context.params.approvalGroupId,
          "approved",
          context.response,
        ),
    );
    router.get(
      "/reject/:approvalGroupId",
      async (context, _next) =>
        await this.approve(
          context.params.approvalGroupId,
          "rejected",
          context.response,
        ),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async approve(
    approvalGroupId: string,
    state: ApprovalState,
    res: Response,
  ) {
    const approvalGroup = await this.approvalGroups.get(
      new mongo.ObjectId(approvalGroupId),
    );
    const approval = await this.approvalGroups.approve(
      approvalGroup,
      state,
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
      approvalGroupId,
      approvalId: `${approval._id.toHexString()}`,
      state,
    };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
