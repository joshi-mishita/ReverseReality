"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [teamId, setTeamId] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [level, setLevel] = useState(1);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("teamId");
    if (stored) {
      setTeamId(stored);
      setLoggedIn(true);
    }
  }, []);

  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ team_id: teamId }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("teamId", teamId);
      setLoggedIn(true);
    } else {
      alert("Team not found");
    }
  };

  const sendMessage = async () => {
    const res = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify({
        message,
        teamId,
      }),
    });

    const data = await res.json();

    setReply(data.reply);
    setSuccess(data.success);
    setLevel(data.level || 1);
  };

  // 🔐 LOGIN UI
  if (!loggedIn) {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h1 style={styles.title}>🌴 ReverseReality</h1>
          <p style={styles.subtitle}>AI Challenge Arena</p>

          <input
            placeholder="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Enter Arena →
          </button>
        </div>
      </div>
    );
  }

  // 🎮 GAME UI
  return (
    <div style={styles.bg}>
      <div style={styles.gameCard}>
        <div style={styles.header}>
          <h2>Level {level} 🎯</h2>
        </div>

        <input
          placeholder="Type your attack prompt..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send →
        </button>

        {reply && (
          <div style={styles.response}>
            <b>AI:</b> {reply}
          </div>
        )}

        {success && (
          <div style={styles.success}>🎉 Level Completed!</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #022c22, #010f0c)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "system-ui",
  },

  card: {
    background: "rgba(0, 50, 30, 0.6)",
    backdropFilter: "blur(20px)",
    padding: "40px",
    borderRadius: "20px",
    width: "320px",
    boxShadow: "0 0 40px rgba(34,197,94,0.2)",
    textAlign: "center",
  },

  gameCard: {
    background: "rgba(0, 50, 30, 0.6)",
    backdropFilter: "blur(20px)",
    padding: "40px",
    borderRadius: "20px",
    width: "500px",
    boxShadow: "0 0 50px rgba(34,197,94,0.2)",
  },

  title: {
    fontSize: "32px",
    fontWeight: "bold",
  },

  subtitle: {
    color: "#4ade80",
    marginBottom: "20px",
  },

  header: {
    marginBottom: "20px",
    fontSize: "22px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #065f46",
    background: "#011d17",
    color: "white",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #16a34a, #22c55e)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "15px",
  },

  response: {
    marginTop: "15px",
    padding: "15px",
    background: "#01281f",
    borderRadius: "10px",
  },

  success: {
    marginTop: "10px",
    color: "#4ade80",
    fontWeight: "bold",
  },
};