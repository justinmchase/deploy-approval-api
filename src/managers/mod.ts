import { Repositories } from "../repositories/mod.ts";
import { Services } from "../services/mod.ts";
import { ApprovalManager } from "./approval/mod.ts";
import { ApprovalGroupManager } from "./approvalGroup/mod.ts";
import { DeploymentManager } from "./deployment/mod.ts";

export * from "./approvalGroup/mod.ts";
export * from "./deployment/mod.ts";
export * from "./approval/mod.ts";

export type Managers = {
  deployments: DeploymentManager;
  approvalGroups: ApprovalGroupManager;
  approvals: ApprovalManager;
};

export async function initManagers(
  _services: Services,
  repositories: Repositories,
) {
  const deployments = new DeploymentManager(
    repositories.deployments,
    repositories.approvalGroups,
    repositories.approvals,
  );
  const approvalGroups = new ApprovalGroupManager(
    repositories.approvalGroups,
    repositories.approvals,
  );
  const approvals = new ApprovalManager(
    repositories.approvals
  );
  return await {
    deployments,
    approvalGroups,
    approvals,
  };
}
