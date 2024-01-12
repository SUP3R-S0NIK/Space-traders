import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css"; // Assurez-vous d'importer votre fichier CSS
import "./../styles/stars.css";
import "./../styles/Connexion.css";

export default function Connexion() {
  const [token, setToken] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [tokenSaisi, setTokenSaisi] = useState("");
  const [symbolJoueur, setSymbolJoueur] = useState("");
  const [selectedWaypointType, setSelectedWaypointType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setToken(tokenSaisi);
  }, [tokenSaisi]);

  useEffect(() => {
    let isMounted = true;
    let allWaypoints = [];
    const fetchAndStoreWaypoints = async (page = 1) => {
      try {
        const systemSymbol = localStorage.getItem("systemSymbol");

        const waypointsResponse = await fetch(
          `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?page=${page}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (!waypointsResponse.ok) {
          console.error(
            "Erreur lors de la récupération des waypoints du système. Veuillez réessayer."
          );
          return;
        }

        const data = await waypointsResponse.json();
        allWaypoints = allWaypoints.concat(data.data);

        // Vérifiez si la longueur des données est inférieure à la limite par page
        const itemsPerPage = data.meta?.limit || 10; // Remplacez 10 par la limite réelle par page si différente
        if (data.data.length === itemsPerPage) {
          // Appel récursif pour récupérer les pages suivantes
          const nextPageData = await fetchAndStoreWaypoints(page + 1);
          console.log(nextPageData);
          allWaypoints = allWaypoints.concat(nextPageData);
        }

        console.log(allWaypoints);

        localStorage.setItem("allWaypoints", JSON.stringify(allWaypoints));

        // Redirigez l'utilisateur vers la route /home
        navigate("/home");
      } catch (error) {
        console.error("Erreur lors de la requête :", error);
      }
    };
    fetchAndStoreWaypoints();
    return () => {
      isMounted = false;
    };
  }, []);

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
