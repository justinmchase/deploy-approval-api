import {
  Application,
  Controller,
  GitHubService,
  mongo,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { assertArrayIncludes } from "std/assert/assert_array_includes.ts";
import { Context, State } from "../../context.ts";
import { ApprovalGroupManager, DeploymentManager } from "../../managers/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";

export class ApprovalController implements Controller<Context, State> {
  constructor(
    private readonly github: GitHubService,
    private readonly deployments: DeploymentManager,
    private readonly approvalGroups: ApprovalGroupManager,
  ) {
  }
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/approval/:approvalGroupId",
      async (context, _next) => {
        const { approvalGroupId } = context.params;
        await this.get(
          new mongo.ObjectId(approvalGroupId),
          context.response,
        );
      }
    )
    router.post(
      "/approval/:approvalGroupId/:approvalState",
      async (context, _next) => {
        const { approvalGroupId, approvalState } = context.params;
        assertArrayIncludes(approvalState, ["approved", "rejected"])
        await this.approval(
          new mongo.ObjectId(approvalGroupId),
          approvalState as ApprovalState,
          context.response,
        );
      }
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async get(
    approvalGroupId: mongo.ObjectId,
    res: Response,
  ) {
    const approvalGroup = await this.approvalGroups.get(approvalGroupId);
    const deployment = await this.deployments.get(approvalGroup.deploymentId);
    const check = await this.deployments.check(deployment)
    console.log(check)

    res.status = Status.OK;
    res.body = {
      deployment,
      approvalGroup,
      check,
    }
    res.headers.set("Content-Type", "application/json");
  }

  private async approval(
    approvalGroupId: mongo.ObjectId,
    approvalState: ApprovalState,
    res: Response,
  ) {
    const approvalGroup = await this.approvalGroups.get(
      new mongo.ObjectId(approvalGroupId),
    );
    const approval = await this.approvalGroups.approve(
      approvalGroup,
      approvalState,
    );
    const deployment = await this.deployments.get(approvalGroup.deploymentId);
    const { state, comment } = await this.deployments.check(
      deployment,
    );
    if (state) {
      const client = await this.github.client(deployment.installationId);
      await this.deployments.approve(client, deployment, state, comment);
    }
    
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
