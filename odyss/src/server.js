import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN, // ✅ Stocké côté serveur
    });

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un assistant pour entrepreneurs." },
        { role: "user", content: message },
      ],
      model: "gpt-4o",
      max_tokens: 1000,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});
app.post("/api/summary", async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    const { data: messages } = await supabase
      .from("chats")
      .select("message")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!messages.length) {
      return res.status(400).json({ error: "Aucune discussion à résumer." });
    }

    const conversationText = messages.map((msg) => msg.message).join(" ");

    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN,
    });

    const response = await client.chat.completions.create({
      messages: [{ role: "system", content: "Résume cette discussion en quelques phrases." }, { role: "user", content: conversationText }],
      model: "gpt-4o",
      max_tokens: 300,
    });

    const summary = response.choices[0].message.content;

    // Enregistrement du résumé dans Supabase
    const { error } = await supabase.from("summaries").insert([
      { session_id: sessionId, user_id: userId, summary }
    ]);

    if (error) {
      console.error("Erreur d'enregistrement dans Supabase :", error);
      return res.status(500).json({ error: "Erreur lors de l'enregistrement du résumé." });
    }

    res.json({ summary });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur lors de la génération du résumé." });
  }
});


app.listen(5000, () => console.log("Serveur lancé sur http://localhost:5000"));
