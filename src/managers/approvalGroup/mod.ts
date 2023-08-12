import { mongo } from "grove";
import { ApprovalState } from "../../models/approval.model.ts";
import { IApprovalGroup } from "../../models/approval_group.model.ts";
import {
  ApprovalGroupRepository,
  ApprovalRepository,
} from "../../repositories/mod.ts";
import { User } from "../../models/user.model.ts";

export class ApprovalGroupManager {
  constructor(
    private readonly approvalGroups: ApprovalGroupRepository,
    private readonly approvals: ApprovalRepository,
  ) {}

  public async get(approvalGroupId: mongo.ObjectId) {
    return await this.approvalGroups.get(approvalGroupId);
  }

  public async approve(
    approver: User,
    approvalGroup: IApprovalGroup,
    state: ApprovalState,
  ) {
    return await this.approvals.create(
      approver,
      approvalGroup,
      state,
    );
  }
}
