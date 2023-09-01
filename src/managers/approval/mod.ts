import { IApprovalGroup } from "../../models/approval_group.model.ts";
import { IDeployment } from "../../models/deployment.model.ts";
import { PageArgs } from "../../models/page.ts";
import { User } from "../../models/user.model.ts";
import { ApprovalRepository } from "../../repositories/mod.ts";

export class ApprovalManager {
  constructor(private readonly approvals: ApprovalRepository) {}

  public async getFor(approver: User, approvalGroup: IApprovalGroup) {
    return await this.approvals.getFor(approver, approvalGroup);
  }
  public async getAllFor(deployment: IDeployment) {
    return await this.approvals.getAllFor(deployment);
  }
  
  public async getAllForUser(args: { user: User } & PageArgs) {
    return await this.approvals.getAllForUser(args);
  }

}