import { NextRequest, NextResponse } from "next/server";

const VALID_USERNAME = "SanjayGouda21";
const VALID_PASSWORD = "Shreya21@";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

      // Set an auth cookie
      response.cookies.set("auth_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error processing request" }, { status: 500 });
  }
}
