import React from "react";

const Home = () => {
  return (
    <div>
      {/* Section d'accueil */}
      <section>
        <h1>Bienvenue sur Odyss</h1>
        <p>La plateforme qui accompagne les entrepreneurs dans leur aventure.</p>
      </section>

      {/* Section Fonctionnalités */}
      <section>
        <h2>Fonctionnalités principales</h2>
        <ul>
          <li>💬 Chat avec l’IA pour explorer ton projet</li>
          <li>💰 Recherche d’aides et subventions</li>
          <li>📊 Calculateur de coûts</li>
          <li>⚖️ Vérification légale</li>
          <li>📖 Bibliothèque de ressources</li>
        </ul>
      </section>

      {/* Section À propos */}
      <section>
        <h2>À propos de nous</h2>
        <p>Odyss a pour mission de rendre l’entrepreneuriat plus accessible grâce à des outils intelligents.</p>
      </section>
    </div>
  );
};

export default Home;
