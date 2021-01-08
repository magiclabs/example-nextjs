import { magic } from '../../lib/magic';
import jwt from 'jsonwebtoken';
import { setTokenCookie } from '../../lib/cookies';

export default async function login(req, res) {
  try {
    const didToken = req.headers.authorization.substr(7);
    await magic.token.validate(didToken);
    const metadata = await magic.users.getMetadataByToken(didToken);
    let token = jwt.sign(
      {
        ...metadata,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // one week
      },
      process.env.JWT_SECRET
    );
    setTokenCookie(res, token);
    res.status(200).json({ done: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
