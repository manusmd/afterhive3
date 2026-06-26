import { toNextJsHandler } from "better-auth/next-js";
import { getPortalAuth } from "./portal-auth";

export const portalAuthHandlers = toNextJsHandler(getPortalAuth());
