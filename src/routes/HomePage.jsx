import React, { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");
  const [symbolDuJoueur, setSymbolDuJoueur] = useState("");
  const [accountId, setAccountId] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [credits, setCredits] = useState("");
  const [startingFaction, setStartingFaction] = useState("");
  const [shipCount, setShipCount] = useState("");

  useEffect(() => {
    // Récupérer les données depuis le localStorage
    const storedToken = localStorage.getItem("token");
    const storedSymbolDuJoueur = localStorage.getItem("symbolDuJoueur");

    setToken(storedToken);
    setSymbolDuJoueur(storedSymbolDuJoueur);

    // Vous pouvez également effectuer une nouvelle requête à l'API pour obtenir les informations mises à jour si nécessaire
    // Assurez-vous de gérer correctement les erreurs et les cas où le token n'est pas valide
  }, []);

  useEffect(() => {
    // Effectuer une requête à l'API avec le token pour obtenir les informations du joueur
    const fetchData = async () => {
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
          setAccountId(donnees.data.accountId);
          setHeadquarters(donnees.data.headquarters);
          setCredits(donnees.data.credits);
          setStartingFaction(donnees.data.startingFaction);
          setShipCount(donnees.data.shipCount);
        } else {
          console.error("Erreur lors de la requête. Veuillez réessayer.");
        }
      } catch (erreur) {
        console.error("Erreur lors de la requête :", erreur);
      }
    };

    // Appel de la fonction pour effectuer la requête à l'API
    fetchData();
  }, [token]);

  return (
    <div>
      <h2>Bienvenue sur la page Home</h2>

      <p>Symbol du joueur : {symbolDuJoueur}</p>
      <p>Account ID : {accountId}</p>
      <p>Headquarters : {headquarters}</p>
      <p>Credits : {credits}</p>
      <p>Starting Faction : {startingFaction}</p>
      <p>Ship Count : {shipCount}</p>
    </div>
  );
}
