import { createRemoteJWKSet, jwtVerify } from "jose";
import { User } from "../../context.ts";
    
const azureTenantId = "22dddbf3-6a10-486d-94dc-b3eca6a4d13e";
const JWKS = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${azureTenantId}/discovery/keys`));
export class AuthService {
  public async verify(jwt: string): Promise<User> {
    const { payload } = await jwtVerify(jwt, JWKS);
    const token = payload as unknown as Record<string, string>;
    return {
      id: token.oid,
      name: token.name,
      email: token.email,
    }
  }
}
