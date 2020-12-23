import jwt from 'jsonwebtoken';

export default async function user(req, res) {
  try {
    let token = req.cookies.token;
    let user = jwt.verify(token, process.env.JWT_SECRET);
    user.token = token; // send JWT in response to the client, necessary for API requests to Hasrua
    res.status(200).json({ user });
  } catch (error) {
    res.status(200).json({ user: null });
  }
}
