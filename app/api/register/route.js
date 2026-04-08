import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { team_id, password } = await req.json();

    if (!team_id || !password) {
      return NextResponse.json({
        success: false,
        message: "Missing fields",
      });
    }

    // 🔹 check if already exists
    const existing = await query(
      "SELECT * FROM teams WHERE team_id = $1",
      [team_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Team already exists",
      });
    }

    // 🔐 hash password
    const hash = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO teams (team_id, team_name, password_hash) VALUES ($1,$2,$3)",
      [team_id, team_id, hash]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}