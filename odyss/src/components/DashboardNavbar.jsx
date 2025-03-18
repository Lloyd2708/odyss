import React from "react";
import { Link } from "react-router-dom";

const DashboardNavbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">🏠 Accueil</Link></li>
       
        <li><Link to="/business-models">📊 Business Models</Link></li> {/* ✅ Ajouté ici */}
        <li><Link to="/ressources">📁 Ressources</Link></li>
        <li><Link to="/chatbot">🤖 Chatbot</Link></li>
    
        <li><Link to="/settings">⚙️ Paramètres</Link></li>
       
      </ul>
    </nav>
  );
};

export default DashboardNavbar;
