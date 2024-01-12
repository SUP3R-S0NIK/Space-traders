import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css"; // Assurez-vous d'importer votre fichier CSS
import "./../styles/stars.css";
import "./../styles/Connexion.css";

export default function Connexion() {
  const [token, setToken] = useState("");

  const [tokenSaisi, setTokenSaisi] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Mettez à jour le token chaque fois que tokenSaisi change
    setToken(tokenSaisi);
  }, [tokenSaisi]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reponse = await fetch("https://api.spacetraders.io/v2/my/agent", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (reponse.ok) {
        const donnees = await reponse.json();

        const headquartersSymbol = donnees.data.headquarters;

        if (!headquartersSymbol) {
          console.error("Le symbole du siège social est indéfini.");
          return;
        }

        const systemSymbol = headquartersSymbol.substring(
          0,
          headquartersSymbol.lastIndexOf("-")
        );

        // Stockez les informations dans le localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("symbolDuJoueur", donnees.data.symbol);
        localStorage.setItem("systemSymbol", systemSymbol);

        // Redirigez l'utilisateur vers la route /home
        navigate("/home");
      } else {
        console.error("Erreur lors de la requête. Veuillez réessayer.");
      }
    } catch (erreur) {
      console.error("Erreur lors de la requête :", erreur);
    }
  };

  return (
    <div className="agent">
      <h2 id="title">Connexion</h2>
      <div>
        <form id="Form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="input"
              required
              autoComplete="off"
              type="text"
              name="Token"
              id="Token"
              value={tokenSaisi}
              onChange={(e) => setTokenSaisi(e.target.value)}
            />
            <label className="label" htmlFor="Token">
              Token
            </label>
          </div>
          <button type="submit" className="button">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
