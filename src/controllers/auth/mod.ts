import {
  oak,
  Controller,
} from "grove";
import { Context, State } from "../../context.ts";
import { AuthService } from "../../services/auth/mod.ts";
import { AuthenticationError } from "../../errors/authentication.error.ts";

export class AuthController implements Controller<Context, State> {
  constructor(private readonly auth: AuthService) {}
  public async use(app: oak.Application<State>): Promise<void> {
    await app.use(this.handler.bind(this))
  }

  private async handler(ctx: oak.Context<State>, next: () => Promise<unknown>) {
    const authorizationHeader = ctx.request.headers.get("authorization");
    if (authorizationHeader) {
      const [kind, jwt] = authorizationHeader.split(" ");
      if (kind !== "Bearer") {
        throw new AuthenticationError("Bearer token expected");
      }
      const user = await this.auth.verify(jwt)
      ctx.state.user = user;
    }
    await next();
  }
}
