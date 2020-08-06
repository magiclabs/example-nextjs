import { decryptCookie } from "../../../utils/cookie";

/**
 * This route checks if a user is autheticated
 */
export default async (req, res) => {
  const { method } = req;

  if (method !== "GET") {
    return res.status(400).json({ message: "This route only accepts GET requests" });
  }

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

  /* send back response with user obj */
  return res.json({ authorized: true, user: userFromCookie });
};
