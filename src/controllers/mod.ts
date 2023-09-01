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
import { DeploymentController } from "./deployment/mod.ts";

export async function initControllers(
  context: Context,
  app: oak.Application<State>,
) {
  const {
    services,
    managers,
  } = context;
  const error = new ErrorController();
  const health = new HealthController();
  const isHtml = new IsHtmlController();
  const log = new LogController();
  const azure = new AzurePublisherDomainController(services.config);
  const site = new SiteController();
  const githubWebhook = new DeployApprovalWebhookController(
    services.config,
    services.github,
    managers.deployments,
  );
  const authentication = new AuthController(services.auth);
  const approve = new ApprovalController(
    services.github,
    managers.deployments,
    managers.approvalGroups,
    managers.approvals,
  );
  const deployment = new DeploymentController(
    managers.deployments,
    managers.approvalGroups,
    managers.approvals
  )
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
  await deployment.use(app);

  // If all else fails 404
  await notFound.use(app);
}
