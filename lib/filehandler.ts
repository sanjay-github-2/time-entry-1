import fs from "fs";
import path from "path";

// Define Task Type
export interface Task {
  id: string;
  date: string; // Format: YYYY-MM-DD
  task: string; // Task name (this was missing)
  timeWorked: number; // Hours worked
  notes: string;
}

// Path to the tasks.json file inside the `data/` folder
const filePath = path.join(process.cwd(), "data", "tasks.json");
console.log(filePath);
// Function to read tasks from tasks.json
export function readTasks(): Task[] {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error("Error reading tasks file:", error);
    return [];
  }
}

// Function to write tasks to tasks.json
export function writeTasks(tasks: Task[]): void {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");
}
