import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Connexion() {
  const [token, setToken] = useState("");
  const [tokenSaisi, setTokenSaisi] = useState("");
  const [symbolJoueur, setSymbolJoueur] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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
        setSymbolJoueur(donnees.data.symbol);

        // Stockez les informations dans le localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("symbolDuJoueur", donnees.data.symbol);

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
      <h2>Page de Connexion</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Token de Connexion :
            <input
              type="text"
              value={tokenSaisi}
              onChange={(e) => setTokenSaisi(e.target.value)}
            />
          </label>
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
