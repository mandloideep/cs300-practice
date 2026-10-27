import { useState } from "react";

const startingTasks = [
  { id: 101, title: "Read the props chapter" },
  { id: 102, title: "Finish the cart lab" },
  { id: 103, title: "Review for the quiz" }
];

function TaskRow({ task }) {
  const [done, setDone] = useState(false);

  return (
    <li className={done ? "task task--done" : "task"}>
      <span>{task.title}</span>
      <button type="button" className="save" aria-pressed={done} onClick={() => setDone(!done)}>
        {done ? "Done" : "Mark done"}
      </button>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(startingTasks);

  return (
    <main>
      <h1>This week</h1>
      <p className="lead">{tasks.length} tasks left.</p>
      <button type="button" onClick={() => setTasks(tasks.slice(1))}>Remove the first task</button>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </main>
  );
}
