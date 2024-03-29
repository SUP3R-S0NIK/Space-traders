import React, { useEffect, useState } from "react";

export default function Contrats() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Récupérer les données depuis le localStorage
    const storedToken = localStorage.getItem("token");

    setToken(storedToken);

    // Vous pouvez également effectuer une nouvelle requête à l'API pour obtenir les informations mises à jour si nécessaire
    // Assurez-vous de gérer correctement les erreurs et les cas où le token n'est pas valide
  }, []);

  useEffect(
    (token) => {
      // Effectuer une requête à l'API avec le token pour obtenir les informations du joueur
      const fetchData = async () => {
        try {
          const reponse = await fetch(
            `https://api.spacetraders.io/v2/my/agent`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (reponse.ok) {
            // Effectuer une deuxième requête pour obtenir la liste des vaisseaux
            const reponseVaisseaux = await fetch(
              `https://api.spacetraders.io/v2/my/contracts`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (reponseVaisseaux.ok) {
            } else {
              console.error(
                "Erreur lors de la requête des vaisseaux. Veuillez réessayer."
              );
            }
          } else {
            console.error("Erreur lors de la requête. Veuillez réessayer.");
          }
        } catch (erreur) {
          console.error("Erreur lors de la requête :", erreur);
        }
      };

      // Appel de la fonction pour effectuer la requête à l'API
      fetchData();
    },
    [token]
  );

  return (
    <div>
      <p>Ship Count : </p>
      <h2>Liste des vaisseaux :</h2>
    </div>
  );
}
