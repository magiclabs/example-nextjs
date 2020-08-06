import { useState, useContext, useEffect } from "react";
import { MagicContext, LoggedInContext, LoadingContext } from "../Store";
import Todo from "./Todo";

const TodoList = () => {
  const [formTodo, setFormTodo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [allTodos, setAllTodos] = useState([]);
  const [magic] = useContext(MagicContext);
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);

  /**
   * Creates a new Todo in the database
   */
  const addTodoToDb = async () => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ formTodo })
    });

    let data = await res.json();

    /* If the db returns {authorized: false}, the cookie has expired, so logout the user */
    /* Else, update our Todo List using the db response */
    !data.authorized ? logout() : setAllTodos(data.todos);
  };

  /**
   * Logs user out of their session with Magic and sets `isLoggedIn` to false
   */
  const logout = async () => {
    setLoggedIn(false);
    await magic.user.logout();
  };

  useEffect(() => {
    /* when loggedIn changes value (i.e. when a user logs in) fetch todos from db */
    if (loggedIn) {
      (async () => {
        setIsLoading(true);

        let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos`);
        let data = await res.json();

        /* set Todos with the db response */
        await setAllTodos(data.user.todos);

        setIsLoading(false);
      })();
    }
  }, [loggedIn]);

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img
          className="loading-gif"
          src="/loading.gif"
          alt="loading..."
          height="35px"
          alt="Loading..."
        />
      ) : // If the user is logged in, show their Todo List
      loggedIn ? (
        <div className="body-container">
          <div className="add-todo-form-container">
            <form className="add-todo-form">
              <input
                className="add-todo-input"
                type="text"
                value={formTodo}
                onChange={e => {
                  setErrorMsg(""); // clear error msg
                  setFormTodo(e.target.value);
                }}
                placeholder=" Enter Todo..."
              />
              <input
                className="add-todo-submit-btn"
                type="submit"
                value="Add"
                onClick={e => {
                  e.preventDefault();
                  if (!formTodo) return setErrorMsg("Field must not be empty."); // if form is empty, show the error msg
                  setFormTodo(""); // clear form input
                  setErrorMsg(""); // clear error msg if there is one
                  addTodoToDb(); // create new Todo in db
                }}
              />
            </form>
            <div className="error-msg">{errorMsg}</div>
          </div>
          <div className="todo-list-container">
            <div className="items-left-display">
              {allTodos && allTodos.filter(todo => todo.completed === false).length} item(s) left
            </div>
            {/* Display all of our Todos by looping through the `allTodos` array */}
            {allTodos &&
              allTodos.map(todo => {
                return (
                  <Todo todo={todo} key={todo._id} allTodos={allTodos} setAllTodos={setAllTodos} />
                );
              })}
          </div>
        </div>
      ) : (
        <div className="body-container instructions-container">
          <ol className="instructions">
            <li className="instructions-item">Log in to get started!</li>
            <li className="instructions-item">Then you can add todos to your list</li>
            <li className="instructions-item">
              To cross off an item, click the{" "}
              <img src="/styled_check.png" className="toggle-complete-btn" />{" "}
            </li>
            <li className="instructions-item">
              Or delete an item by clicking the{" "}
              <span className="delete-todo-btn-example">&#10005;</span>
            </li>
          </ol>
        </div>
      )}
    </>
  );
};

export default TodoList;
