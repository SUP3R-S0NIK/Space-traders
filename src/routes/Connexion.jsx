import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";
import "./../styles/stars.css";
import "./../styles/Connexion.css";

export default function Connexion() {
  const [tokenSaisi, setTokenSaisi] = useState("");

  const navigate = useNavigate();

  const fetchAndStoreWaypoints = async (systemSymbol, page = 1) => {
    try {
      const systemSymbolenr = systemSymbol;
      console.log(systemSymbol);
      const waypointsResponse = await fetch(
        `https://api.spacetraders.io/v2/systems/${systemSymbolenr}/waypoints?page=${page}`,
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
        return [];
      }

      const waypointsData = await waypointsResponse.json();
      const allWaypoints = waypointsData.data;

      // Vérifiez si la longueur des données est inférieure à la limite par page
      const itemsPerPage = waypointsData.meta?.limit || 10;
      if (waypointsData.data.length === itemsPerPage) {
        // Appel récursif pour récupérer les pages suivantes
        const nextPageData = await fetchAndStoreWaypoints(
          systemSymbol,
          page + 1
        );
        return allWaypoints.concat(nextPageData);
      }

      return allWaypoints;
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://api.spacetraders.io/v2/my/agent", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenSaisi}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const symbolJoueur = data.data.symbol;
        const headquartersSymbol = data.data.headquarters;

        if (!headquartersSymbol) {
          console.error("Le symbole du siège social est indéfini.");
          return;
        }

        const systemSymbol = headquartersSymbol.substring(
          0,
          headquartersSymbol.lastIndexOf("-")
        );
        const allWaypoints = await fetchAndStoreWaypoints(systemSymbol);
        console.log("sys", systemSymbol);

        console.log(allWaypoints);

        localStorage.setItem("token", tokenSaisi);
        localStorage.setItem("symbolDuJoueur", symbolJoueur);
        localStorage.setItem("allWaypoints", JSON.stringify(allWaypoints));
        localStorage.setItem("systemSymbol", systemSymbol);

        navigate("/home");
      } else {
        console.error("Erreur lors de la requête. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
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
