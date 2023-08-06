import { Services } from "../services/mod.ts";

export type Repositories = {
  dummy: unknown;
};

export async function initRepositories(_services: Services) {;
  return await {
    dummy: true,
  };
}