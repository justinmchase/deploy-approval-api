import {
  Application,
  Controller,
  Response,
  Router,
  Status,
} from "grove/mod.ts";
import { Context, State } from "../../context.ts";

export class AzurePublisherDomainController implements Controller<Context, State> {
  public async use(app: Application<State>): Promise<void> {
    const router = new Router();
    router.get(
      "/ce608137-10fc-4b3e-824b-a3b601a2f424",
      async (context, _next) => await this.handler(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(res: Response) {
    res.status = Status.OK;
    res.body = `{
      "associatedApplications": [
        {
          "applicationId": "ce608137-10fc-4b3e-824b-a3b601a2f424"
        }
      ]
    }`
    res.headers.set("Content-Type", "application/html");
    await undefined;
  }
}
