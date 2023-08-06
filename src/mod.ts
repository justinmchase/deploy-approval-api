import { Context, State } from "./context.ts";
import { initControllers } from "./controllers/mod.ts";
import { initServices } from "./services/mod.ts";
import { initRepositories } from "./repositories/mod.ts";
import { initManagers } from "./managers/mod.ts";
import {
  ConsoleLogger,
  Grove,
  WebMode,
} from "grove/mod.ts";

async function initContext(): Promise<Context> {
  const log = new ConsoleLogger();
  const services = await initServices(log);
  const repositories = await initRepositories(services);
  const managers = await initManagers(repositories);
  return {
    log,
    services,
    repositories,
    managers,
  };
}

const grove = new Grove({
  initContext,
  modes: [
    new WebMode<Context, State>({ initControllers }),
  ],
});

await grove.start(Deno.args);