import { IContext, IState } from "grove";
import { Services } from "./services/mod.ts";
import { Repositories } from "./repositories/mod.ts";
import { Managers } from "./managers/mod.ts";
import { User } from "./models/user.model.ts";

export interface Context extends IContext {
  services: Services;
  repositories: Repositories;
  managers: Managers;
}

export interface State extends IState<Context> {
  user?: User
}
