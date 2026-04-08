import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req) {
  try {
    const { message, teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({
        reply: "❌ No team ID provided",
        success: false,
      });
    }

    // 🔹 GET CURRENT LEVEL FROM PROGRESS
    let progress = await query(
      "SELECT * FROM team_progress WHERE team_id = $1 ORDER BY level_id DESC LIMIT 1",
      [teamId]
    );

    let levelOrder = 1;

    if (progress && progress.rows.length > 0) {
      const last = progress.rows[0];

      // If completed → go next level
      levelOrder =
        last.status === "completed"
          ? last.level_id + 1
          : last.level_id;
    }

    // 🔹 GET LEVEL DATA
    const levelData = await query(
      "SELECT * FROM levels WHERE order_index = $1",
      [levelOrder]
    );

    if (!levelData || levelData.rows.length === 0) {
      return NextResponse.json({
        reply: "🎉 All levels completed!",
        success: true,
        level: levelOrder,
      });
    }

    const level = levelData.rows[0];

    const systemPrompt = level.system_prompt;
    const answer = level.win_condition;
    const levelId = level.id;

    // 🔹 SAVE USER MESSAGE
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
        level: levelOrder,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content || "❌ No response";

    // 🔹 SAVE AI RESPONSE
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
        [teamId, levelOrder, "completed", 1, level.points]
      ).catch(() => {});
    } else {
      // Update attempts
      await query(
        "INSERT INTO team_progress (team_id, level_id, status, attempts, points_earned) VALUES ($1,$2,$3,$4,$5)",
        [teamId, levelOrder, "in_progress", 1, 0]
      ).catch(() => {});
    }

    return NextResponse.json({
      reply,
      success,
      level: levelOrder,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json({
      reply: "❌ Server error",
      success: false,
    });
  }
}