import { mongo, MongoService, NotFoundError } from "grove";
import { ApprovalState, IApproval, User } from "../../models/mod.ts";
import { IApprovalGroup } from "../../models/approval_group.model.ts";
import { IDeployment } from "../../models/deployment.model.ts";
import { PageArgs } from "../../models/page.ts";

export class ApprovalRepository {
  private readonly approvals: mongo.Collection<IApproval>;
  constructor(mongo: MongoService) {
    this.approvals = mongo.collection<IApproval>("approvals");
  }

  public async getFor(approver: User, approvalGroup: IApprovalGroup) {
    return await this.approvals.findOne(
      {
        approvalGroupId: approvalGroup._id,
        "approver.id": approver.id,
      }
    )
  }
  
  public async getAllForUser(args: { user: User } & PageArgs) {
    const { user: { id: userId }, offset, limit } = args
    type ResultType = {
      total: [{ total: number }],
      results: IApproval[]
    }
    const [result] = await this.approvals.aggregate<ResultType>([
      {
        $match: {
          "approver.id": userId
        }
      },
      {
        $sort: {
          "_id": -1
        }
      },
      {
        $facet: {
          total: [
            {
              $count: "total"
            }
          ],
          results: [
            {
              $skip: offset
            },
            {
              $limit: limit
            },
            {
              $lookup: {
                from: "deployments",
                localField: "deploymentId",
                foreignField: "_id",
                as: "deployment"
              }
            },
            {
              $lookup: {
                from: "approvalGroups",
                localField: "approvalGroupId",
                foreignField: "_id",
                as: "approvalGroup"
              }
            },
            {
              $unwind: "$deployment"
            },
            {
              $unwind: "$approvalGroup"
            },
          ]
        }
      }
    ])
    .toArray();

    const { total, results } = result;
    return {
      total: total[0]?.total ?? 0,
      results
    }
  }


  public async getAllFor(deployment: IDeployment) {
    return await this.approvals.find({ deploymentId: deployment._id }).toArray();
  }

  public async create(
    approver: User,
    group: IApprovalGroup,
    state: ApprovalState,
  ) {
    const { _id: approvalGroupId, name: approvalGroupName, deploymentId } = group;
    const approval = await this.approvals.findAndModify(
      {
        deploymentId,
        approvalGroupId,
        "approver.id": approver.id,
      },
      {
        new: true,
        upsert: true,
        update: {
          $setOnInsert: {
            deploymentId,
            approvalGroupId,
            approvalGroupName,
            createdAt: new Date()
          },
          $set: {
            approver,
            state,
            updatedAt: new Date()
          }
        }
      }
    );
    if (!approval) {
      throw new NotFoundError("IApproval", `${deploymentId}.${approvalGroupId}.${approver.id}`);
    }
    return approval;
  }
}
