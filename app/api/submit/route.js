import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req) {
  try {
    const { message, teamId, level } = await req.json();

    // ❌ validation
    if (!teamId || !message) {
      return NextResponse.json({
        reply: "❌ Missing data",
        success: false,
      });
    }

    // 🔹 GET LEVEL DATA (based on selected level from UI)
    const levelData = await query(
      "SELECT * FROM levels WHERE order_index = $1",
      [level]
    );

    if (!levelData || levelData.rows.length === 0) {
      return NextResponse.json({
        reply: "❌ Level not found",
        success: false,
      });
    }

    const currentLevel = levelData.rows[0];

    const systemPrompt = currentLevel.system_prompt;
    const winCondition = currentLevel.win_condition;
    const levelId = currentLevel.id;

    // 🔹 SAVE USER MESSAGE
    await query(
      "INSERT INTO chat_history (team_id, level_id, role, message) VALUES ($1,$2,$3,$4)",
      [teamId, levelId, "user", message]
    );

    // 🔹 CALL OPENROUTER API
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await res.json();
    console.log("AI RESPONSE:", data);

    // ❌ API error handling
    if (data.error) {
      return NextResponse.json({
        reply: "❌ API Error: " + data.error.message,
        success: false,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content || "❌ No response";

    // 🔹 SAVE AI RESPONSE
    await query(
      "INSERT INTO chat_history (team_id, level_id, role, message) VALUES ($1,$2,$3,$4)",
      [teamId, levelId, "assistant", reply]
    );

    // 🔥 CHECK IF LEVEL COMPLETED
    const success = reply
      .toLowerCase()
      .includes(winCondition.toLowerCase());

    // 🔹 SAVE PROGRESS
    await query(
      "INSERT INTO team_progress (team_id, level_id, status, attempts, points_earned) VALUES ($1,$2,$3,$4,$5)",
      [
        teamId,
        level,
        success ? "completed" : "in_progress",
        1,
        success ? currentLevel.points : 0,
      ]
    );

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