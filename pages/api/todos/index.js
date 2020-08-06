import { decryptCookie } from "../../../utils/cookie";
import User from "../../../models/User";
import Todo from "../../../models/Todo";

export default async (req, res) => {
  const { method } = req;

  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.status(401).json({ authorized: false, error });
  }

  if (method === "GET") {
    try {
      /* get user from DB */
      const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

      /* send back response with user obj */
      return res.json({ authorized: true, user });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }

  /**
   * CREATE todo in DB
   */
  if (method === "POST") {
    try {
      /* create new Todo */
      const newTodo = new Todo({ todo: JSON.parse(req.body).formTodo, completed: false });

      /* save Todo */
      const savedTodo = await newTodo.save();

      /* find user in DB */
      let userFromDb = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

      /* add new todo to user's array of todos */
      userFromDb.todos.push(savedTodo);

      /* save user */
      await userFromDb.save();

      /* send back res with saved todo */
      return res.json({ authorized: true, todos: userFromDb.todos });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }

  return res.json({ authorized: false, message: "This route only accepts GET and POST requests" });
};
