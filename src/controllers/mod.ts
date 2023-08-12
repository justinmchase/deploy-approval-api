import {
  oak,
  ErrorController,
  HealthController,
  IsHtmlController,
  LogController,
  NotFoundController,
} from "grove";
import { Context, State } from "../context.ts";
import { DeployApprovalWebhookController } from "./github_webhook/mod.ts";
import { SiteController } from "./site/mod.ts";
import { ApprovalController } from "./approval/mod.ts";
import { AzurePublisherDomainController } from "./azure/mod.ts";
import { AuthController } from "./auth/mod.ts";

export async function initControllers(
  context: Context,
  app: oak.Application<State>,
) {
  const {
    services: {
      config,
      github,
      auth,
    },
    managers: {
      deployments,
      approvalGroups,
    },
  } = context;
  const error = new ErrorController();
  const health = new HealthController();
  const isHtml = new IsHtmlController();
  const log = new LogController();
  const azure = new AzurePublisherDomainController(config);
  const site = new SiteController();
  const githubWebhook = new DeployApprovalWebhookController(
    config,
    github,
    deployments,
  );
  const authentication = new AuthController(auth);
  const approve = new ApprovalController(
    github,
    deployments,
    approvalGroups,
  );
  const notFound = new NotFoundController();

  await error.use(app);
  await health.use(app);
  await isHtml.use(app);
  await log.use(app);
  await site.use(app);
  await azure.use(app);
  await githubWebhook.use(app);

  await authentication.use(app);
  await approve.use(app);

  // If all else fails 404
  await notFound.use(app);
}
