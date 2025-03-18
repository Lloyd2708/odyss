import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Assurez-vous que supabase est bien configuré
import DashboardNavbar from "../components/DashboardNavbar";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadUserFiles(user.id);
    }
  }, [user, navigate]);

  // 📌 Charger les fichiers de l'utilisateur depuis Supabase
  const loadUserFiles = async (userId) => {
    try {
      console.log("🔄 Chargement des fichiers pour :", userId);
      const { data, error } = await supabase.storage
        .from("user-files")
        .list(`${userId}/`, { limit: 100 });

      if (error) throw error;
      console.log("✅ Fichiers récupérés :", data);
      setFiles(data);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des fichiers :", error.message);
    }
  };

  // 📌 Sauvegarder un fichier
  const saveFile = async () => {
    if (!selectedFile || !user) {
      console.error("⚠️ Aucun fichier sélectionné ou utilisateur non connecté.");
      return;
    }

    console.log("📂 Upload du fichier :", selectedFile.name);

    const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `${user.id}/${safeFileName}`; // 🔥 Correction du chemin

    try {
      const { data, error } = await supabase.storage
        .from("user-files")
        .upload(filePath, selectedFile, { upsert: true });

      if (error) throw error;

      console.log("✅ Fichier sauvegardé :", selectedFile.name);
      loadUserFiles(user.id);
    } catch (error) {
      console.error("❌ Erreur d'upload :", error.message);
    }
  };

  // 📌 Télécharger un fichier
  const downloadFile = async (file) => {
    try {
      console.log("📥 Téléchargement du fichier :", file.name);

      const { data, error } = await supabase.storage
        .from("user-files")
        .download(`${user.id}/${file.name}`); // 🔥 Correction du chemin

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Fichier téléchargé :", file.name);
    } catch (error) {
      console.error("❌ Erreur de téléchargement :", error.message);
    }
  };

  // 📌 Supprimer un fichier
  const deleteFile = async (fileName) => {
    try {
      console.log("🗑️ Suppression du fichier :", fileName);

      const filePath = `${user.id}/${fileName}`; // 🔥 Correction du chemin
      const { error } = await supabase.storage
        .from("user-files")
        .remove([filePath]);

      if (error) throw error;

      console.log("✅ Fichier supprimé :", fileName);
      loadUserFiles(user.id);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error.message);
    }
  };

  // 📌 Déconnexion
  const handleLogout = async () => {
    console.log("🔴 Déconnexion...");
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
    window.location.reload();
  };

  // 📌 Gestion de l'upload
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div>
      <DashboardNavbar />
      <h1>Bienvenue sur votre Tableau de Bord</h1>
      <p>Connecté en tant que : {user?.email}</p>

      {/* Upload */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={saveFile}>Enregistrer</button>
      </div>

      {/* Liste des fichiers */}
      <h2>📂 Fichiers :</h2>
      <ul>
        {files.length === 0 ? (
          <p>Aucun fichier enregistré.</p>
        ) : (
          files.map((file, index) => (
            <li key={index}>
              {file.name}{" "}
              <button onClick={() => downloadFile(file)}>📥 Télécharger</button>
              <button onClick={() => deleteFile(file.name)}>🗑️ Supprimer</button>
            </li>
          ))
        )}
      </ul>

      {/* Déconnexion */}
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default Dashboard;
