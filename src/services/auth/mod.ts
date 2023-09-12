import { JWTVerifyGetKey, createRemoteJWKSet, jwtVerify } from "jose";
import { User } from "../../models/user.model.ts";

export class AuthService {
  
  private readonly keys: JWTVerifyGetKey;
  constructor(config: { azureTenantId: string, azureB2CWorkflow: string }) {
    const { azureTenantId, azureB2CWorkflow } = config;
    const keyUri = `https://deployapproval.b2clogin.com/deployapproval.onmicrosoft.com/${azureB2CWorkflow}/discovery/v2.0/keys`
    this.keys = createRemoteJWKSet(new URL(keyUri));
  }

  public async verify(jwt: string): Promise<User> {
    const verified = await jwtVerify(jwt, this.keys);
    const { payload } = verified
    const token = payload as unknown as Record<string, string>;
    return {
      id: token.oid,
      name: token.name,
      email: token.email,
    }
  }
}
