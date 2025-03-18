import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../AuthProvider";
import { v4 as uuidv4 } from "uuid";
import "./Chatbot.css"; // Ajout du fichier CSS

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [summary, setSummary] = useState(""); // Zone pour afficher le résumé
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("session_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des sessions :", error);
      } else {
        const uniqueSessions = [...new Map(data.map((item) => [item.session_id, item])).values()];
        setSessions(uniqueSessions);
      }
    };

    fetchSessions();
  }, [user]);

  const loadSession = async (session_id) => {
    setSelectedSession(session_id);
    setSessionId(session_id);

    const { data: messagesData } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    setMessages(messagesData || []);

    // Charger le résumé
    const { data: summaryData } = await supabase
      .from("summaries")
      .select("summary")
      .eq("user_id", user.id)
      .eq("session_id", session_id)
      .single();

    setSummary(summaryData?.summary || "");
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id || loading) return;

    setLoading(true);
    const newSessionId = sessionId || uuidv4();

    if (input.trim() === "/resume") {
      generateSummary(newSessionId);
      setInput("");
      return;
    }

    const userMessage = {
      user_id: user.id,
      message: input,
      sender: "user",
      session_id: newSessionId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSessionId(newSessionId);

    await supabase.from("chats").insert([userMessage]);

    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, sessionId: newSessionId }),
    });

    if (response.ok) {
      const data = await response.json();
      const botMessage = {
        user_id: user.id,
        session_id: newSessionId,
        message: data.reply,
        sender: "bot",
        created_at: new Date().toISOString(),
      };

      await supabase.from("chats").insert([botMessage]);
      setMessages((prev) => [...prev, botMessage]);
    }

    setLoading(false);
  };

  const generateSummary = async (sessionId) => {
    setLoading(true);

    const response = await fetch("http://localhost:5000/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId: user.id }),
    });

    if (response.ok) {
      const data = await response.json();
      setSummary(data.summary);

      await supabase
        .from("summaries")
        .upsert([{ session_id: sessionId, user_id: user.id, summary: data.summary }]);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h3>📜 Historique</h3>
        <ul>
          {sessions.map((session) => (
            <li key={session.session_id} className={selectedSession === session.session_id ? "selected" : ""}>
              <div onClick={() => loadSession(session.session_id)}>
                🗂 {new Date(session.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chatbox">
        <h2>🤖 Chatbot</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === "user" ? "user" : "bot"}>
              <strong>{msg.sender === "user" ? "👤 Vous : " : "🤖 Bot : "}</strong> {msg.message}
            </div>
          ))}
          {loading && <div className="loader"></div>}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="summary">
          <h3>📝 Résumé</h3>
          <p>{summary || "Aucun résumé disponible."}</p>
        </div>

        <div className="input-container">
          <input type="text" placeholder="Pose ta question..." value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
          <button onClick={handleSendMessage} disabled={loading}>{loading ? "⏳..." : "📤 Envoyer"}</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
