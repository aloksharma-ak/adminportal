import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiUrl = process.env.API_URL;
    if (!apiUrl) throw new Error("API_URL missing");

    const res = await fetch(`${apiUrl}/api/User/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestGuid: crypto.randomUUID(),
        requestTime: new Date().toISOString(),
        firstName: body.firstName,
        lastName: body.lastName,
        userName: body.userName,
        password: body.password,
      }),
    });

    const data = await res.json();

    // pass-through response from backend
    return NextResponse.json(data, { status: res.status });
  } catch (eny) {
    return NextResponse.json(
      {
        status: false,
        message: typeof eny === "string" ? eny : "Failed to register",
      },
      { status: 500 },
    );
  }
}
