import {
  Application,
  ErrorController,
  HealthController,
  IsHtmlController,
  LogController,
  NotFoundController,
} from "grove/mod.ts";
import { Context, State } from "../context.ts";
import { DeployApprovalWebhookController } from "./github_webhook/mod.ts";
import { SiteController } from "./site/mod.ts";

export async function initControllers(
  context: Context,
  app: Application<State>,
) {
  const {
    services: {
      config,
      github,
    },
  } = context;
  const error = new ErrorController();
  const health = new HealthController();
  const isHtml = new IsHtmlController();
  const log = new LogController();
  const githubWebhook = new DeployApprovalWebhookController(config, github);
  const site = new SiteController();
  const notFound = new NotFoundController();

  await error.use(app);
  await health.use(app);
  await isHtml.use(app);
  await log.use(app);
  await githubWebhook.use(app);
  await site.use(app);

  // If all else fails 404
  await notFound.use(app);
}
