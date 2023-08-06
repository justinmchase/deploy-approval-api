import { Repositories } from "../repositories/mod.ts";

export type Managers = {
  dummy: unknown;
};

export async function initManagers(_repositories: Repositories) {
  return await {
    dummy: true,
  };
}
