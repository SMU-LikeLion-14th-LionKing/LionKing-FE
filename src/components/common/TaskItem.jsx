import TaskCheckbox from "./TaskCheckbox";

export default function TaskItem({
  title,
  dueDate,
  completed = false,
  checked,
  onChange,
  className = "",
}) {
  const isCompleted = checked ?? completed;

  return (
    <article
      className={`rounded-lg border p-4 ${
        isCompleted ? "border-green bg-[#f4fbf4]" : "border-gray-5 bg-white"
      } ${className}`}
    >
      <TaskCheckbox
        label={title}
        date={dueDate}
        checked={checked}
        defaultChecked={checked === undefined ? completed : undefined}
        onChange={onChange}
        className={isCompleted ? "line-through" : ""}
      />
    </article>
  );
}
