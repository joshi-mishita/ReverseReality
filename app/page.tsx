"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [level, setLevel] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);
    setReply("");
    setSuccess(false);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      setReply(data.reply);
      setSuccess(data.success);
      setLevel(data.level || 1);
    } catch (err) {
      setReply("❌ Error sending message");
    }

    setLoading(false);
  };

  return (
    <main style={styles.container}>
      {/* HEADER */}
      <h1 style={styles.title}>🔥 ReverseReality AI Challenge</h1>
      <h2 style={styles.level}>Level {level} 🎯</h2>

      {/* INPUT BOX */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your jailbreak prompt..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* USER */}
      {message && (
        <div style={styles.cardUser}>
          <strong>🧑 You:</strong>
          <p>{message}</p>
        </div>
      )}

      {/* AI */}
      {reply && (
        <div style={styles.cardAI}>
          <strong>🤖 AI:</strong>
          <p>{reply}</p>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div style={styles.success}>
          🎉 Level Completed! Next Level Unlocked 🚀
        </div>
      )}

      {/* ERROR */}
      {reply.startsWith("❌") && (
        <div style={styles.error}>❌ Try Again</div>
      )}
    </main>
  );
}

/* 🌴 TROPICAL DARK THEME STYLES */

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white",
    padding: "40px",
    fontFamily: "Poppins, sans-serif",
  },

  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#00ffd5",
    textShadow: "0 0 10px #00ffd5",
  },

  level: {
    marginTop: "10px",
    color: "#ffb347",
  },

  inputContainer: {
    marginTop: "30px",
    display: "flex",
    gap: "10px",
  },

  input: {
    padding: "12px",
    width: "320px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "#1e2a38",
    color: "white",
  },

  button: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(45deg, #ff7e5f, #feb47b)",
    color: "black",
    fontWeight: "bold",
    transition: "0.3s",
  },

  cardUser: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "12px",
    background: "#1b263b",
    borderLeft: "4px solid #00ffd5",
  },

  cardAI: {
    marginTop: "15px",
    padding: "15px",
    borderRadius: "12px",
    background: "#16213e",
    borderLeft: "4px solid #ff7e5f",
  },

  success: {
    marginTop: "20px",
    padding: "12px",
    background: "#00ff88",
    color: "black",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  error: {
    marginTop: "10px",
    color: "#ff4d4d",
    fontWeight: "bold",
  },
};