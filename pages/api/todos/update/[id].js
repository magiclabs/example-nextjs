import { decryptCookie } from "../../../../utils/cookie";
import User from "../../../../models/User";
import Todo from "../../../../models/Todo";

export default async (req, res) => {
  const {
    query: { id }, // id from query params
    method // request method (i.e. GET, POST, PUT, DELETE)
  } = req;

  if (method !== "PUT") {
    return res.json({ authorized: false, message: "This route only accepts PUT requests" });
  }

  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /**
   * UPDATE todo (toggle completed/not completed)
   */
  try {
    /* update Todo (completed/not completed) */
    await Todo.updateOne({ _id: id }, { $set: { completed: JSON.parse(req.body).completed } });

    /* grab user */
    let user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* return user */
    return res.json({ authorized: true, user });
  } catch (error) {
    /* if error, send back error */
    return res.json({ authorizeed: false, error });
  }
};
