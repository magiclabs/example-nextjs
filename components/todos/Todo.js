import { useContext } from "react";
import { MagicContext, LoggedInContext } from "../Store";

const Todo = ({ todo, allTodos, setAllTodos }) => {
  const [magic] = useContext(MagicContext);
  const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);

  const toggleCompletedDb = async (id, completed) => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos/update/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, completed })
    });

    let data = await res.json();

    /**
     * If user is not authorized (the cookie has expired), logout user
     * Else, update the Todo List using the response from the db
     */
    !data.authorized ? logout() : setAllTodos(data.user.todos);
  };

  const deleteFromDb = async id => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos/delete/${id}`, {
      method: "DELETE"
    });

    let data = await res.json();

    /* If the database responds with {authorized: false}, logout user */
    !data.authorized && logout();
  };

  /* Remove the deleted Todo from our displayed Todo List */
  const removeTodoFromView = id => {
    let newTodos = allTodos.filter(todo => id !== todo._id);
    setAllTodos(newTodos);
  };

  /* Set `loggedIn` to false and log the user out of their session with Magic */
  const logout = async () => {
    setIsLoggedIn(false);
    await magic.user.logout();
  };

  return (
    /* If the Todo has the `completed` attribute, add `completed` to the className */
    <div className={`todo-item-container ${todo.completed ? `completed` : ""}`}>
      {todo && (
        <div className={`todo-item-name`}>
          <img
            /* Change the img source depending on if the Todo is completed or not */
            src={todo.completed ? "/unstyled_check.png" : "/styled_check.png"}
            className="toggle-complete-btn"
            onClick={async e => {
              /* Update the `completed` attribute in our database */
              let todoDiv = e.target.parentElement.parentElement;
              let completed = todoDiv.classList.contains("completed") ? false : true;
              await toggleCompletedDb(todo._id, completed);
            }}
          />
          {todo.todo}
        </div>
      )}
      <form>
        <input
          type="button"
          value="&#10005;"
          className="delete-todo-btn"
          onClick={() => {
            deleteFromDb(todo._id);
            removeTodoFromView(todo._id);
          }}
        />
      </form>
    </div>
  );
};

export default Todo;
