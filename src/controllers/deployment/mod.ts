import { assertExists } from "std/assert/assert_exists.ts";
import {
  oak,
  mongo,
  Controller,
} from "grove";
import { Context, State } from "../../context.ts";
import { ApprovalGroupManager, DeploymentManager } from "../../managers/mod.ts";
import { ApprovalManager } from "../../managers/mod.ts";

export class DeploymentController implements Controller<Context, State> {
  constructor(
    private readonly deployments: DeploymentManager,
    private readonly approvalGroups: ApprovalGroupManager,
    private readonly approvals: ApprovalManager
  ) {
  }
  public async use(app: oak.Application<State>): Promise<void> {
    const router = new oak.Router<State>();
    router.get(
      "/deployment/:deploymentId",
      async (context) => {
        const { user } = context.state;
        const { deploymentId } = context.params;
        assertExists(user);
        await this.get(
          new mongo.ObjectId(deploymentId),
          context.response,
        );
      }
    )
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async get(
    deploymentId: mongo.ObjectId,
    res: oak.Response,
  ) {
    const deployment = await this.deployments.get(deploymentId);
    const approvalGroups = await this.approvalGroups.getAllFor({ deployment });
    const approvals = await this.approvals.getAllFor(deployment)
    const check = await this.deployments.check(deployment);
    res.status = oak.Status.OK;
    res.body = {
      ok: true,
      deployment,
      approvalGroups,
      approvals,
      check,
    }
    res.headers.set("Content-Type", "application/json");
  }
}
