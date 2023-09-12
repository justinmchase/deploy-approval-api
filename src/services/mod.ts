import { getEnv, GitHubService, ILogger, MongoService } from "grove";
import { ConfigService } from "./config/mod.ts";
import { AuthService } from "./auth/mod.ts";

export * from "./config/mod.ts";

export interface Services {
  config: ConfigService;
  github: GitHubService;
  mongo: MongoService;
  auth: AuthService;
}

export async function initServices(log: ILogger): Promise<Services> {
  const env = await getEnv();
  const config = new ConfigService(env);
  const github = await GitHubService.create(log, config);
  const mongo = await MongoService.create(log, config);
  const auth = new AuthService(config);
  return {
    config,
    github,
    mongo,
    auth,
  };
}
