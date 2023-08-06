import { ILogger, getEnv } from "grove/mod.ts";
import { ConfigService } from "./config/mod.ts";
import { GithubService } from "./github/mod.ts";

export * from "./config/mod.ts";
export * from "./github/mod.ts";

export interface Services {
  config: ConfigService
  github: GithubService
}

export async function initServices(log: ILogger): Promise<Services> {
  const env = await getEnv()
  const config = new ConfigService(env);
  const github = await GithubService.createGithubService(log, config);
  return {
    config,
    github,
  };
}