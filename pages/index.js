import TodoList from "../components/todos/TodoList";
import Store from "../components/Store";

const TodoView = () => {
  return (
    <Store>
      <TodoList />
    </Store>
  );
};

export default TodoView;
