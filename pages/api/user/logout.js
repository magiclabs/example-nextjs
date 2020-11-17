import { magic } from "../../../utils/magic";
import { cookie } from "../../../utils/cookie";
import { serialize } from "cookie";

export default async (req, res) => {
  /* replace current auth cookie with an expired one */
  res.setHeader(
    "Set-Cookie",
    serialize("auth", "", {
      ...cookie,
      expires: new Date(Date.now() - 1),
    })
  );

  let userFromCookie;

  try {
    /**
     * `userFromCookie` will be on the form of:
     * {
     * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * email: 'example@gmail.com'
     * }
     */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /* log use out of Magic */
  await magic.users.logoutByPublicAddress(userFromCookie.publicAddress);

  return res.json({ authorized: false });
};
