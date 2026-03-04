import TodoItem from './TodoItem';

export default function TodoList({ todos, toggleTodo }) {
  return (
    <div className="mt-6">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          {...todo} 
          onToggle={() => toggleTodo(todo.id)} 
        />
      ))}
    </div>
  );
}