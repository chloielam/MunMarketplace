import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to backend Socket.io server
const socket = io("http://localhost:3000", { transports: ["websocket"] });

export default function ChatPage() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (data) => setMessages((prev) => [...prev, data]));

    // Cleanup on unmount
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;

    // Change sender & receiver dynamically if needed
    const data = { sender: "kriti@mun.ca", receiver: "buyer@mun.ca", message: msg };

    socket.emit("sendMessage", data);
    setMessages((prev) => [...prev, data]);
    setMsg("");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>💬 Real-time Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "300px",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.sender}:</b> {m.message}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type message..."
        style={{ padding: "0.5rem", width: "70%", marginRight: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button
        onClick={sendMessage}
        style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "#fff", borderRadius: "4px", border: "none", cursor: "pointer" }}
      >
        Send
      </button>
    </div>
  );
}
