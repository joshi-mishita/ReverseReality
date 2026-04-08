import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const teamId = 1;

    // 🔹 Get current level from progress
    let progress = await query(
      "SELECT * FROM team_progress WHERE team_id = $1 ORDER BY level_id DESC LIMIT 1",
      [teamId]
    );

    let level = 1;

    if (progress && progress.rows.length > 0) {
      const last = progress.rows[0];
      level = last.status === "completed" ? last.level_id + 1 : last.level_id;
    }

    // 🔹 Get level data
    const levelData = await query(
      "SELECT * FROM levels WHERE order_index = $1",
      [level]
    );

    const systemPrompt =
      levelData?.rows?.[0]?.system_prompt ||
      "You are a secure AI.";

    const answer =
      levelData?.rows?.[0]?.win_condition || "hack123";

    const levelId = levelData?.rows?.[0]?.id;

    // 🔹 Save user message
    await query(
      "INSERT INTO chat_history (team_id, level_id, role, message) VALUES ($1,$2,$3,$4)",
      [teamId, levelId, "user", message]
    ).catch(() => {});

    // 🔹 AI CALL
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ReverseReality",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({
        reply: "❌ API Error: " + data.error.message,
        success: false,
        level,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content || "❌ No response";

    // 🔹 Save AI reply
    await query(
      "INSERT INTO chat_history (team_id, level_id, role, message) VALUES ($1,$2,$3,$4)",
      [teamId, levelId, "assistant", reply]
    ).catch(() => {});

    // 🔥 CHECK WIN CONDITION
    const success = reply.toLowerCase().includes(answer);

    if (success) {
      // Mark level completed
      await query(
        "INSERT INTO team_progress (team_id, level_id, status, attempts, points_earned) VALUES ($1,$2,$3,$4,$5)",
        [teamId, level, "completed", 1, levelData.rows[0].points]
      ).catch(() => {});
    }

    return NextResponse.json({
      reply,
      success,
      level,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json({
      reply: "❌ Server error",
      success: false,
    });
  }
}