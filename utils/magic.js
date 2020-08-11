import { Magic } from "@magic-sdk/admin";

/* initiate Magic instance */
export const magic = new Magic(process.env.MAGIC_SECRET_KEY);
