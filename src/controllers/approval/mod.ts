import {
  oak,
  mongo,
  Controller,
  GitHubService,
} from "grove";
import { assertArrayIncludes } from "std/assert/assert_array_includes.ts";
import { Context, State } from "../../context.ts";
import { ApprovalGroupManager, DeploymentManager } from "../../managers/mod.ts";
import { ApprovalState } from "../../models/approval.model.ts";
import { assertExists } from "https://deno.land/std@0.195.0/assert/assert_exists.ts";
import { ApprovalManager } from "../../managers/mod.ts";
import { ApprovalCheck } from "../../repositories/mod.ts";

export class ApprovalController implements Controller<Context, State> {
  constructor(
    private readonly github: GitHubService,
    private readonly deployments: DeploymentManager,
    private readonly approvalGroups: ApprovalGroupManager,
    private readonly approvals: ApprovalManager
  ) {
  }
  public async use(app: oak.Application<State>): Promise<void> {
    const router = new oak.Router<State>();
    router.get(
      "/approval/:approvalGroupId",
      async (context) => {
        const { user } = context.state;
        const { approvalGroupId } = context.params;
        assertExists(user);
        await this.get(
          user,
          new mongo.ObjectId(approvalGroupId),
          context.response,
        );
      }
    )
    router.post(
      "/approval/:approvalGroupId/:approvalState",
      async (context) => {
        const { user } = context.state;
        const { approvalGroupId, approvalState } = context.params;
        assertArrayIncludes(["approved", "rejected"], [approvalState])
        assertExists(user);
        await this.approval(
          user,
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
    approver: User,
    approvalGroupId: mongo.ObjectId,
    res: oak.Response,
  ) {
    const approvalGroup = await this.approvalGroups.get(approvalGroupId);
    const approval = await this.approvals.getFor(
      approver,
      approvalGroup,
    );
    const deployment = await this.deployments.get(approvalGroup.deploymentId);
    const check = await this.deployments.check(deployment)
    res.status = oak.Status.OK;
    res.body = {
      ok: true,
      approval,
      deployment,
      approvalGroup,
      check,
    }
    res.headers.set("Content-Type", "application/json");
  }

  private async approval(
    approver: User,
    approvalGroupId: mongo.ObjectId,
    approvalState: ApprovalState,
    res: oak.Response,
  ) {
    const approvalGroup = await this.approvalGroups.get(
      new mongo.ObjectId(approvalGroupId),
    );
    const deployment = await this.deployments.get(approvalGroup.deploymentId);
    let approval = await this.approvals.getFor(
      approver,
      approvalGroup,
    );
    let check: ApprovalCheck
    if (approval?.state !== approvalState && !deployment.state) {
      // If the deployment hasn't yet been approved or rejected 
      // And the user approvalState is different then the existing approval they submitted
      // ...then submit the new approval and check
      approval = await this.approvalGroups.approve(
        approver,
        approvalGroup,
        approvalState
      )
      check = await this.deployments.check(deployment);
      if (check.state) {
        // This approval was the final approver needed, approving the deployment
        const client = await this.github.client(deployment.installationId);
        await this.deployments.approve(client, deployment, check.state);
      }
    } else {
      check = await this.deployments.check(deployment);
    }
    res.status = oak.Status.OK;
    res.body = {
      ok: true,
      approval,
      deployment,
      approvalGroup,
      check,
    };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
