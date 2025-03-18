import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🟢 CHARGER OU CRÉER LE PROFIL AU DÉMARRAGE
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;

      setEmail(session.user.email); // 🔹 Email est bloqué, mais affiché.

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, notifications")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.warn("Pas encore de profil, création en cours...");
        // 🔹 Si l'utilisateur n'a pas encore de profil, on le crée
        await supabase.from("profiles").insert([
          { id: session.user.id, full_name: "", notifications: true }
        ]);
      } else {
        setName(data.full_name || "");
        setNotifications(data.notifications ?? true);
      }
    };

    fetchUserData();
  }, [session, supabase]);

  // 🟢 METTRE À JOUR LE PROFIL (NOM ET NOTIFICATIONS)
  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id, // 🔹 On s'assure que l'ID est bien utilisé
        full_name: name,
        notifications: notifications,
      });

    if (error) {
      setMessage("❌ Erreur lors de la mise à jour.");
    } else {
      setMessage("✅ Profil mis à jour !");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  
      // 🔹 Redirection manuelle après la déconnexion
      window.location.href = "/login"; // 🔥 Force le rechargement et enlève la session
  
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error.message);
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>Paramètres</h2>

      <div>
        <label>Nom :</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Email :</label>
        <input type="email" value={email} disabled />
      </div>

      <div>
        <label>Notifications :</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
        />
      </div>

      <button onClick={handleUpdateProfile} disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && <p>{message}</p>}

      <button onClick={handleLogout} style={{ marginTop: "20px", color: "red" }}>
        Se Déconnecter
      </button>
    </div>
  );
};

export default Settings;
