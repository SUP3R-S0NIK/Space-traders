import React, { useEffect, useState } from "react";
import "./../styles/ship.css";
import Menu from "./Menu";
import Loader from "./loader";

export default function AchatVaisseaux() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [ships, setShips] = useState([]);
  const [systemSymbol, setSystemSymbol] = useState("");
  const [scannedData, setScannedData] = useState(null); // Nouvel état pour stocker les données scannées

  useEffect(() => {
    // Récupérer les données depuis le localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchShipsData = async () => {
    try {
      const response = await fetch(
        `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShips(data.data); // Stockez les données des vaisseaux dans l'état
        setScannedData(data); // Stockez les données scannées
      } else {
        console.error(
          "Erreur lors de la requête des vaisseaux. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la requête des vaisseaux :", error);
    } finally {
      // Même en cas d'erreur, arrêtez le chargement
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Durée de 10 secondes
    }
  };

  const handleScan = () => {
    // Fonction appelée lors du clic sur le bouton de scan
    if (systemSymbol) {
      fetchShipsData(); // Lancez la recherche uniquement si le système symbol est défini
    } else {
      console.error(
        "Veuillez saisir un système symbol avant de lancer le scan."
      );
    }
  };

  return (
    <div className="page">
      <Menu />
      <div>
        <h2 id="title">Acheter des vaisseaux :</h2>
        <div className="main">
          <label htmlFor="systemSymbol">Système Symbol :</label>
          <input
            type="text"
            id="systemSymbol"
            value={systemSymbol}
            onChange={(e) => setSystemSymbol(e.target.value)}
          />
          <button onClick={handleScan}>Lancer le scan</button>
        </div>

        {scannedData && (
          <div className="scanned-results">
            <h3>Résultats du scan :</h3>
            {/* Affichez ici les informations scannées selon votre structure */}
            {scannedData.data.map((waypoint) => (
              <div key={waypoint.symbol}>
                <p>Symbol : {waypoint.symbol}</p>
                <p>Type : {waypoint.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
