import { Services } from "../services/mod.ts";
import { ApprovalRepository } from "./approval/mod.ts";
import { ApprovalGroupRepository } from "./approval_groups/mod.ts";
import { DeploymentRepository } from "./deployments/mod.ts";

export * from "./approval/mod.ts";
export * from "./approval_groups/mod.ts";
export * from "./deployments/mod.ts";

export type Repositories = {
  deployments: DeploymentRepository;
  approvalGroups: ApprovalGroupRepository;
  approvals: ApprovalRepository;
};

export async function initRepositories(services: Services) {
  const deployments = new DeploymentRepository(services.mongo);
  const approvalGroups = new ApprovalGroupRepository(services.mongo);
  const approvals = new ApprovalRepository(services.mongo);
  return await {
    deployments,
    approvalGroups,
    approvals,
  };
}
