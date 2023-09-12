import { readInt, readRequiredString, readString } from "grove";

export class ConfigService {
  public readonly githubAppId: number;
  public readonly githubPrivateKey: string;
  public readonly githubWebhookPath: string;
  public readonly githubWebhookSecret?: string;
  public readonly mongoConnectionString: string;
  public readonly azureTenantId: string;
  public readonly azureClientId: string;
  public readonly azureClientSecret?: string;
  public readonly appOrigin: string;
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
    this.azureTenantId = readString(env, "AZURE_TENANT_ID", "bb47d1e0-0ffb-4077-a04e-352c73ebebfa");
    this.azureClientId = readString(env, "AZURE_CLIENT_ID", "1a9fa409-389c-4da1-877a-fe20bca08edd");
    this.azureClientSecret = readString(env, "AZURE_CLIENT_SECRET");
    this.appOrigin = readString(env, "APP_ORIGIN", "localhost:8080")
  }
}
