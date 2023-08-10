import { readInt, readRequiredString, readString } from "grove/mod.ts";

export class ConfigService {
  public readonly githubAppId: number;
  public readonly githubPrivateKey: string;
  public readonly githubWebhookPath: string;
  public readonly githubWebhookSecret?: string;
  public readonly mongoConnectionString: string;
  public readonly azureClientId: string;
  public readonly azureClientSecret?: string;
  constructor(env: Record<string, string>) {
    this.githubAppId = readInt(env, "GITHUB_APP_ID", 372035);
    this.githubPrivateKey = readRequiredString(env, "GITHUB_PRIVATE_KEY");
    this.githubWebhookPath = readString(
      env,
      "GITHUB_WEBHOOK_PATH",
      "/github_webhook",
    );
    this.githubWebhookSecret = readString(env, "GITHUB_WEBHOOK_SECRET");
    this.mongoConnectionString = readRequiredString(
      env,
      "MONGO_CONNECTION_STRING",
    );
    this.azureClientId = readString(env, "AZURE_CLIENT_ID", "ce608137-10fc-4b3e-824b-a3b601a2f424");
    this.azureClientSecret = readString(env, "AZURE_CLIENT_SECRET");
  }
}
