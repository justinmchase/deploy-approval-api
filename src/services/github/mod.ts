import {
  encode as base64Encode,
} from "std/encoding/base64.ts";

import { 
ILogger,
  Request,
  hmacCreateKey,
  hmacVerify
} from "grove/mod.ts";
import { ConfigService } from "../config/mod.ts"
import { SignatureError } from "../../errors/signature.error.ts";

export class GithubService {
  constructor(
    private readonly appId: number,
    private readonly privateKey: string,
    private readonly secret?: CryptoKey,
  ) {
  }

  public static async createGithubService(log: ILogger, config: ConfigService) {
    const { githubAppId, githubPrivateKey, githubWebhookSecret } = config;
    const secret = githubWebhookSecret
      ? await hmacCreateKey(base64Encode(githubWebhookSecret))
      : undefined

    log.debug(
      "github_service",
      "github service initializing",
      {
        githubAppId,
        githubPrivateKey: !!githubPrivateKey,
        githubWebhookSecret: !!githubWebhookSecret,
      }
    )
    return new GithubService(
      githubAppId,
      githubPrivateKey,
      secret,
    )
  }

  
  public async verify(req: Request) {
    if (this.secret) {
      const signature = req.headers.get("X-Hub-Signature-256");
      if (!signature) {
        throw new SignatureError("invalid signature");
      }
      const [, sig] = signature.split("=");
      const bytes = await req.body({ type: "bytes" }).value;
      const verified = await hmacVerify(
        this.secret,
        sig,
        bytes,
      );
      if (!verified) {
        throw new SignatureError("signature does not match body");
      }
    }
  }
}
