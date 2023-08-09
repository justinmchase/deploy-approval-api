import { getEnv, GitHubService, ILogger, MongoService } from "grove/mod.ts";
import { ConfigService } from "./config/mod.ts";

export * from "./config/mod.ts";

export interface Services {
  config: ConfigService;
  github: GitHubService;
  mongo: MongoService;
}

export async function initServices(log: ILogger): Promise<Services> {
  const env = await getEnv();
  const config = new ConfigService(env);
  const github = await GitHubService.create(log, config);
  const mongo = await MongoService.create(log, config);
  return {
    config,
    github,
    mongo,
  };
}
