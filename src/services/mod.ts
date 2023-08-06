import { getEnv, GitHubService, ILogger } from "grove/mod.ts";
import { ConfigService } from "./config/mod.ts";

export * from "./config/mod.ts";

export interface Services {
  config: ConfigService;
  github: GitHubService;
}

export async function initServices(log: ILogger): Promise<Services> {
  const env = await getEnv();
  const config = new ConfigService(env);
  const github = await GitHubService.create(log, config);
  return {
    config,
    github,
  };
}
