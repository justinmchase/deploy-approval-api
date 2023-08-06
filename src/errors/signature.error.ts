import { ApplicationError, Status } from "grove/mod.ts";

export class SignatureError extends ApplicationError {
  constructor(details?: string) {
    super(
      Status.Unauthorized,
      "E_SIGNATURE",
      "invalid signature",
      details,
    );
  }
}
