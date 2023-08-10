import {
  Application,
  Controller,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";
import { ConfigService } from "../../services/mod.ts";

export class AzurePublisherDomainController implements Controller<Context, State> {
  constructor(private readonly config: ConfigService) {}
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/.well-known/microsoft-identity-association.json",
      async (context, _next) => await this.handler(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(res: Response) {
    res.status = Status.OK;
    res.body = {
      associatedApplications: [
        {
          applicationId: this.config.azureClientId
        }
      ]
    }
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
