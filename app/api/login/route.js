import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { team_id, password } = await req.json();

    const result = await query(
      "SELECT * FROM teams WHERE team_id = $1",
      [team_id]
    );

    if (!result || result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Team not found",
      });
    }

    const team = result.rows[0];

    // 🔐 compare password
    const valid = await bcrypt.compare(
      password,
      team.password_hash
    );

    if (!valid) {
      return NextResponse.json({
        success: false,
        message: "Wrong password",
      });
    }

    return NextResponse.json({
      success: true,
      team: team,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}