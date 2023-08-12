import { IApprovalGroup } from "../../models/approval_group.model.ts";
import { User } from "../../models/user.model.ts";
import { ApprovalRepository } from "../../repositories/mod.ts";

export class ApprovalManager {
  constructor(private readonly approvals: ApprovalRepository) {}

  public async getFor(approver: User, approvalGroup: IApprovalGroup) {
    return await this.approvals.getFor(approver, approvalGroup);
  }
}