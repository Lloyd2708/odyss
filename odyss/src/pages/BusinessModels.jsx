import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../AuthProvider";
import DashboardNavbar from "../components/DashboardNavbar";

const BusinessModels = () => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [file, setFile] = useState(null);

  // Charger les fichiers depuis le stockage Supabase
  useEffect(() => {
    const fetchModels = async () => {
      if (!user?.id) return;

      // 🔥 Lister les fichiers du bucket "business"
      const { data, error } = await supabase.storage
        .from("business") // 📂 Bucket correct
        .list(`business_models/${user.id}`); // 📁 Chemin du dossier utilisateur

      if (error) {
        console.error("Erreur de récupération :", error);
      } else {
        setModels(data); // ✅ Met à jour la liste des fichiers
      }
    };

    fetchModels();
  }, [user]);

  // Upload d'un fichier
  const handleUpload = async () => {
    if (!file || !user?.id) return alert("Sélectionne un fichier !");

    const filePath = `business_models/${user.id}/${file.name}`;

    const { error } = await supabase.storage
      .from("business") // 📂 Nom du bucket
      .upload(filePath, file);

    if (error) {
      console.error("Erreur d'upload :", error);
      alert("Échec de l'upload !");
    } else {
      alert("Fichier uploadé avec succès !");
      window.location.reload();
    }
  };

  // Télécharger un fichier
  const handleDownload = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("business") // 📂 Bucket correct
      .download(filePath);

    if (error) {
      console.error("Erreur de téléchargement :", error);
    } else {
      const url = URL.createObjectURL(data);
      window.open(url, "_blank");
    }
  };

  return (
    <div>
      <DashboardNavbar />
      <h2>📂 Mes Business Models</h2>

      {/* Upload d'un fichier */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>📤 Télécharger</button>

      {/* Liste des fichiers */}
      <ul>
        {models.map((model) => (
          <li key={model.name}>
            {model.name} 
            <button onClick={() => handleDownload(`business_models/${user.id}/${model.name}`)}>
              📥 Télécharger
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessModels;
