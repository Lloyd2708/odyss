import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>; // 🔥 Attendre avant d'afficher

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
