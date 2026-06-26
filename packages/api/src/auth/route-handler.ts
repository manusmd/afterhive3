import { toNextJsHandler } from "better-auth/next-js";
import { getAdminAuth } from "./admin-auth";

export const adminAuthHandlers = toNextJsHandler(getAdminAuth());
