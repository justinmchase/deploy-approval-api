import { Repositories } from "../repositories/mod.ts";
import { Services } from "../services/mod.ts";
import { DeploymentManager } from "./deployment/mod.ts";

export type Managers = {
  deployments: DeploymentManager
};

export async function initManagers(
  _services: Services,
  repositories: Repositories
) {
  const deployments = new DeploymentManager(
    repositories.deployments,
    repositories.approvalGroups,
    repositories.approvals,
  )
  return await {
    deployments
  };
}
