import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/features">Fonctionnalités</Link></li>
        <li><Link to="/about">À propos</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/login">Login/Signup</Link></li> {/* 🔹 Ajout du bouton */}
      </ul>
    </nav>
  );
};

export default Navbar;
