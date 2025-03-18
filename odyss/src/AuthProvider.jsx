import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase.js";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // ✅ On laisse l'utilisateur voir l'accueil, mais protège les pages privées
      const isPublicPage = ["/", "/features", "/about", "/contact", "/login"].includes(location.pathname);
      if (!session?.user && !isPublicPage) {
        navigate("/login");
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? <p>Chargement...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
