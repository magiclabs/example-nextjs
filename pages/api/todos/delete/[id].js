import { decryptCookie } from "../../../../utils/cookie";
import User from "../../../../models/User";
import Todo from "../../../../models/Todo";

export default async (req, res) => {
  const {
    query: { id }, // id from query params
    method // request method (i.e. GET, POST, PUT, DELETE)
  } = req;

  if (method !== "DELETE") {
    return res.json({ authorized: false, message: "This route only accepts DELETE requests" });
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
   * DELETE todo from database
   */
  try {
    /* get user from DB */
    const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* delete Todo */
    await Todo.deleteOne({ _id: id });

    /* remove Todo from user's `todos` array */
    user.todos = user.todos.filter(t => t._id !== id);

    /* save user */
    await user.save();

    /* send back response noting the user was authorized to delete this todo */
    return res.json({ authorized: true });
  } catch (error) {
    /* if error, send back error */
    return res.json({ authorizeed: false, error });
  }
};
