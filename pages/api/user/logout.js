import { cookie } from "../../../utils/cookie";
import { serialize } from "cookie";

export default async (req, res) => {
  /* replace current auth cookie with an expired one */
  res.setHeader(
    "Set-Cookie",
    serialize("auth", "", {
      ...cookie,
      expires: new Date(Date.now() - 1)
    })
  );

  return res.json({ authorized: false });
};
