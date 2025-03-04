import { NextRequest, NextResponse } from "next/server";
import {clientPromise} from "../../../lib/filehandler";

export async function GET() {
  try {
    const client = await clientPromise;

    console.log("client", client);
    
    const db = client.db("timeentry");


    const tasks = await db.collection("tasks").find({}).toArray();

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, task, timeWorked, notes } = body;

    if (!date || !task || !timeWorked) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;

    console.log("--------------------------------",client);
    
    const db = client.db("timeentry");

    const newTask = {
      date,
      task,
      timeWorked: Number(timeWorked),
      notes: notes || "",
      createdAt: new Date(),
    };

    await db.collection("tasks").insertOne(newTask);

    return NextResponse.json({ message: "Task saved!", task: newTask }, { status: 200 });
  } catch (error) {
    console.error("Error saving task:", error);
    return NextResponse.json({ message: "Error saving task" }, { status: 500 });
  }
}
