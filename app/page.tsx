"use client";

import { useState, useEffect } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const [levels] = useState(
    Array.from({ length: 15 }, (_, i) => i + 1)
  );
  const [currentLevel, setCurrentLevel] = useState(1);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // 🔹 Auto login
  useEffect(() => {
    const stored = localStorage.getItem("teamId");
    if (stored) {
      setTeamId(stored);
      setLoggedIn(true);
      fetchLeaderboard();
    }
  }, []);

  // 🔹 Fetch leaderboard
  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setLeaderboard(data.leaderboard || []);
  };

  // 🔐 LOGIN / REGISTER
  const handleAuth = async () => {
    const url = isRegister ? "/api/register" : "/api/login";

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        team_id: teamId,
        password,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("teamId", teamId);
      setLoggedIn(true);
      fetchLeaderboard();
    } else {
      alert(data.message || "Error");
    }
  };

  // 💬 SEND MESSAGE
  const sendMessage = async () => {
    if (!message) return;

    const newChat: ChatMessage[] = [
      ...chat,
      { role: "user", text: message },
    ];

    setChat(newChat);

    const res = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify({
        message,
        teamId,
        level: currentLevel,
      }),
    });

    const data = await res.json();

    setChat([
      ...newChat,
      { role: "assistant", text: data.reply },
    ]);

    setMessage("");

    // 🔥 Update leaderboard after each move
    fetchLeaderboard();
  };

  // 🔐 AUTH SCREEN
  if (!loggedIn) {
    return (
      <div style={styles.loginBg}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>🌴 ReverseReality</h1>
          <p style={styles.subtitle}>
            {isRegister ? "Register Team" : "Login Team"}
          </p>

          <input
            placeholder="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleAuth} style={styles.button}>
            {isRegister ? "Register" : "Login"}
          </button>

          <p
            style={styles.switchText}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already have account? Login"
              : "New team? Register"}
          </p>
        </div>
      </div>
    );
  }

  // 🎮 MAIN UI
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>Levels</h2>

        {levels.map((lvl) => (
          <div
            key={lvl}
            onClick={() => {
              setCurrentLevel(lvl);
              setChat([]);
            }}
            style={{
              ...styles.levelItem,
              background:
                currentLevel === lvl ? "#16a34a" : "transparent",
            }}
          >
            Level {lvl}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={styles.chatArea}>
        <div style={styles.chatHeader}>
          Level {currentLevel} 🎯
        </div>

        <div style={styles.chatBox}>
          {chat.map((msg, i) => (
            <div
              key={i}
              style={
                msg.role === "user"
                  ? styles.userMsg
                  : styles.aiMsg
              }
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div style={styles.inputBox}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your prompt..."
            style={styles.chatInput}
          />

          <button onClick={sendMessage} style={styles.sendBtn}>
            Send
          </button>
        </div>
      </div>

      {/* 🏆 LEADERBOARD */}
      <div style={styles.leaderboard}>
        <h3>🏆 Leaderboard</h3>

        {leaderboard.map((team, index) => (
          <div key={index} style={styles.rankCard}>
            <span>#{index + 1}</span>
            <span>{team.team_id}</span>
            <span>{team.total_points || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#02140f",
    color: "white",
    fontFamily: "system-ui",
  },

  sidebar: {
    width: "220px",
    background: "#012d22",
    padding: "20px",
    borderRight: "1px solid #065f46",
  },

  levelItem: {
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  chatHeader: {
    padding: "20px",
    borderBottom: "1px solid #065f46",
    fontSize: "20px",
  },

  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  userMsg: {
    alignSelf: "flex-end",
    background: "#16a34a",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "10px",
    maxWidth: "60%",
  },

  aiMsg: {
    alignSelf: "flex-start",
    background: "#013a2c",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "10px",
    maxWidth: "60%",
  },

  inputBox: {
    display: "flex",
    padding: "15px",
    borderTop: "1px solid #065f46",
  },

  chatInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#011d17",
    color: "white",
  },

  sendBtn: {
    marginLeft: "10px",
    padding: "12px 20px",
    background: "#16a34a",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
  },

  leaderboard: {
    width: "250px",
    background: "#011d17",
    padding: "20px",
    borderLeft: "1px solid #065f46",
  },

  rankCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    marginTop: "10px",
    background: "#013a2c",
    borderRadius: "8px",
  },

  loginBg: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#02140f",
  },

  loginCard: {
    padding: "40px",
    background: "#012d22",
    borderRadius: "20px",
    width: "300px",
    textAlign: "center",
  },

  title: {
    fontSize: "28px",
  },

  subtitle: {
    color: "#4ade80",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #065f46",
    background: "#011d17",
    color: "white",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#16a34a",
    border: "none",
    borderRadius: "10px",
    color: "white",
  },

  switchText: {
    marginTop: "10px",
    cursor: "pointer",
    color: "#4ade80",
  },
};