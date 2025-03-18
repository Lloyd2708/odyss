import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const resumesDir = path.join(__dirname, "..", "..", "Chatbot", "resume");

// Middleware
app.use(express.json());
app.use(cors());

// Vérifier si le dossier existe, sinon le créer
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Récupérer tous les résumés
app.get("/resumes", (req, res) => {
  const files = fs.readdirSync(resumesDir);
  const resumes = files.map((file) => ({
    id: file.replace(".json", ""),
    content: fs.readFileSync(path.join(resumesDir, file), "utf8"),
  }));
  res.json(resumes);
});

// Ajouter un résumé
app.post("/resumes", (req, res) => {
  const { id, content } = req.body;
  if (!id || !content) return res.status(400).json({ error: "ID et contenu requis" });

  const filePath = path.join(resumesDir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ content }, null, 2), "utf8");

  res.json({ message: "Résumé ajouté", id });
});

// Modifier un résumé
app.put("/resumes/:id", (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const filePath = path.join(resumesDir, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Résumé introuvable" });
  }

  fs.writeFileSync(filePath, JSON.stringify({ content }, null, 2), "utf8");
  res.json({ message: "Résumé modifié" });
});

// Supprimer un résumé
app.delete("/resumes/:id", (req, res) => {
  const { id } = req.params;
  const filePath = path.join(resumesDir, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Résumé introuvable" });
  }

  fs.unlinkSync(filePath);
  res.json({ message: "Résumé supprimé" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
});
