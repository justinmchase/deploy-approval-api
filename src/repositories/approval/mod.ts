import { mongo, MongoService, NotFoundError } from "grove/mod.ts";
import { ApprovalState, IApproval } from "../../models/mod.ts";
import { IApprovalGroup } from "../../models/approval_group.model.ts";

export class ApprovalRepository {
  private readonly approvals: mongo.Collection<IApproval>;
  constructor(mongo: MongoService) {
    this.approvals = mongo.collection<IApproval>("approvals");
  }

  public async create(
    group: IApprovalGroup,
    state: ApprovalState,
    comment?: string,
  ) {
    const { _id: approvalGroupId } = group;
    const approvalId = await this.approvals.insertOne(
      {
        approvalGroupId,
        state,
        comment,
        createdAt: new Date(),
      },
    );
    const approval = await this.approvals.findOne({ _id: approvalId });
    if (!approval) {
      throw new NotFoundError("IApproval", `${approvalId}`);
    }
    return approval;
  }
}
