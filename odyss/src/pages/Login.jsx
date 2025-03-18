import React, { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate("/dashboard"); // 🚀 Redirection vers le dashboard après connexion
      }, 2000);
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Un lien de connexion a été envoyé à votre email !");
    }
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Connexion / Inscription</h1>
      {loading ? <p>Chargement...</p> : (
        <>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Se connecter par email</button>
          </form>
          <button onClick={handleGitHubLogin}>Se connecter avec GitHub</button>
          <button onClick={() => navigate("/")}>🏠 Retour à l'accueil</button>
        </>
      )}
    </div>
  );
};

export default Login;
