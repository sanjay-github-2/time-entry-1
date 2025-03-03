import { NextRequest, NextResponse } from "next/server";
import { readTasks, writeTasks, Task } from "../../../lib/filehandler";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const tasks: Task[] = readTasks();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error reading tasks:", error);
    return NextResponse.json({ message: "Error reading tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, task, timeWorked, notes } = body;

    if (!date || !task || !timeWorked) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newTask: Task = {
      id: uuidv4(),
      date,
      task,
      timeWorked: Number(timeWorked),
      notes: notes || "",
    };

    const tasks: Task[] = readTasks();
    tasks.push(newTask);
    writeTasks(tasks);

    return NextResponse.json({ message: "Task saved!", task: newTask }, { status: 200 });
  } catch (error) {
    console.error("Error saving task:", error);
    return NextResponse.json({ message: "Error saving task" }, { status: 500 });
  }
}
