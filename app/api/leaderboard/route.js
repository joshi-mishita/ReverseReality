import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        team_id,
        SUM(points_earned) AS total_points
      FROM team_progress
      GROUP BY team_id
      ORDER BY total_points DESC
    `);

    return NextResponse.json({
      leaderboard: result.rows,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({
      leaderboard: [],
    });
  }
}