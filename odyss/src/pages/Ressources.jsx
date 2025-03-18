import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../AuthProvider";
import DashboardNavbar from "../components/DashboardNavbar";
import { addNotification } from "../utils/notification";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Ressources = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  // Charger les fichiers depuis le stockage Supabase
  useEffect(() => {
    const fetchFiles = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase.storage
        .from("ressources") 
        .list(`ressources/${user.id}`);

      if (error) {
        console.error("Erreur de récupération :", error);
      } else {
        setFiles(data);
      }
    };

    fetchFiles();

    // 🎯 Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          toast.info(`🔔 ${payload.new.message}`); // ✅ Affiche une pop-up en temps réel
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Upload d'un fichier
  const handleUpload = async () => {
    if (!file || !user?.id) return alert("Sélectionne un fichier !");

    const filePath = `ressources/${user.id}/${file.name}`;

    const { error } = await supabase.storage
      .from("ressources") 
      .upload(filePath, file);

    if (error) {
      console.error("Erreur d'upload :", error);
      alert("Échec de l'upload !");
    } else {
      await addNotification(user.id, `Nouveau fichier : ${file.name}`); // ✅ Ajoute une notif en DB
      toast.success("✅ Fichier uploadé avec succès !");
      window.location.reload();
    }
  };

  // Télécharger un fichier
  const handleDownload = async (filePath) => {
    const { data, error } = await supabase.storage
      .from("ressources")
      .download(filePath);

    if (error) {
      console.error("Erreur de téléchargement :", error);
      toast.error("❌ Erreur de téléchargement !");
    } else {
      const url = URL.createObjectURL(data);
      window.open(url, "_blank");
      toast.success("📥 Téléchargement en cours...");
    }
  };

  return (
    <div>
      <DashboardNavbar />
      <h2>📂 Mes Ressources</h2>

      {/* Activer les notifications */}
      <button onClick={() => toast.info("🔔 Notifications activées !")}>
        🔔 Activer les notifications
      </button>

      {/* Upload d'un fichier */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>📤 Télécharger</button>

      {/* Liste des fichiers */}
      <h3>📁 Fichiers</h3>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.name} 
            <button onClick={() => handleDownload(`ressources/${user.id}/${file.name}`)}>
              📥 Télécharger
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ressources;
