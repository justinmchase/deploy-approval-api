import { JWTVerifyGetKey, createRemoteJWKSet, jwtVerify } from "jose";
import { User } from "../../models/user.model.ts";

export class AuthService {
  
  private readonly keys: JWTVerifyGetKey;
  constructor(config: { azureTenantId: string }) {
    const { azureTenantId } = config;
    this.keys = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${azureTenantId}/discovery/keys`));
  }

  public async verify(jwt: string): Promise<User> {
    const { payload } = await jwtVerify(jwt, this.keys);
    const token = payload as unknown as Record<string, string>;
    return {
      id: token.oid,
      name: token.name,
      email: token.email,
    }
  }
}
