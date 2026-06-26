import { toNextJsHandler } from "better-auth/next-js";
import { getPlatformAuth } from "./platform-auth";

export const platformAuthHandlers = toNextJsHandler(getPlatformAuth());
