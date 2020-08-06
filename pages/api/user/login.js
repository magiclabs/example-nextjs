import { Magic } from "@magic-sdk/admin";
import { encryptCookie, cookie } from "../../../utils/cookie";
import { serialize } from "cookie";
import User from "../../../models/User";
import dbConnect from "../../../models/connection";

/* open connection to database */
dbConnect();

/* initiate Magic instance */
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

/* save new user to database */
const signup = async (user, iat) => {
  let newUser = {
    email: user.email,
    issuer: user.issuer,
    lastLoginAt: iat
  };
  return await new User(newUser).save();
};

export default async (req, res) => {
  const { method } = req;

  if (method !== "POST") {
    return res.status(400).json({ message: "Only POST requests are accepted" });
  }

  /* strip token from Authorization header */
  let DIDT = magic.utils.parseAuthorizationHeader(req.headers.authorization);

  /* validate token to ensure request came from the issuer */
  await magic.token.validate(DIDT);

  /**
   * decode token to get claim obj with data, see https://docs.magic.link/admin-sdk/node-js/sdk/token-module/decode#returns
   *
   * `claim` will be in the form of
   * {
   * iat: 1595635806,
   * ext: 1595636706,
   * iss: 'did:ethr:0x84Ebf8BD2b35dA715A5351948f52ebcB57B7916A',
   * sub: 'LSZlrB5urQNFIXEXpTdVnI6BzwdJNJMlfqsEJvrCvRI=',
   * aud: 'did:magic:026e022c-9b57-42bf-95d4-997543be1c21',
   * nbf: 1595635806,
   * tid: 'aea69063-0665-41ca-a2e2-4ff36c734703',
   * add: '0xf6ee75197340d270156c25054a99edda0edfc0b491fe1b433c9360481c043992428c82ca8b341272ba81d8004ddfbf739dda2368743349db0b9f97f3293707aa1c'
   * }
   */
  let claim = magic.token.decode(DIDT)[1];

  /**
   * get user data from Magic
   *
   * `userMetadata` will be on the form of:
   * {
   * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * email: 'example@gmail.com'
   * }
   */
  const userMetadata = await magic.users.getMetadataByIssuer(claim.iss);

  /* check if user is already in */
  const existingUser = await User.findOne({ issuer: claim.iss });

  /* Create new user if doesn't exist */
  !existingUser && signup(userMetadata, claim.iat);

  /* encrypted cookie details */
  const token = await encryptCookie(userMetadata);

  /* set cookie */
  await res.setHeader("Set-Cookie", serialize("auth", token, cookie));

  /* send back response with user obj */
  return res.json({ authorized: true, user: userMetadata });
};
