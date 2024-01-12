import React, { useEffect, useState } from "react";
import "./../styles/buy.css";
import Menu from "./Menu";
import Loader from "./loader";
import PopupAchat from "./popup-achat";

export default function AchatVaisseaux() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [systemSymbol, setSystemSymbol] = useState("");
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [selectedWaypointSymbol, setSelectedWaypointSymbol] = useState(null);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");
    const storedSystemSymbol = localStorage.getItem("systemSymbol");
    setSystemSymbol(storedSystemSymbol || "");

    const fetchWaypointsData = async () => {
      console.log("SS", systemSymbol);
      try {
        const response = await fetch(
          `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=SHIPYARD`,
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
          console.log("data: ", data);
          setScannedData(data);
        } else {
          console.error(
            "Erreur lors de la requête des waypoints. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la requête des waypoints :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaypointsData();
  }, [token, systemSymbol]);

  const handleScan = () => {
    if (systemSymbol) {
      // Logique de numérisation ici
    } else {
      console.error(
        "Veuillez saisir un système symbol avant de lancer le scan."
      );
    }
  };

  const handleBuyButtonClick = (waypointSymbol) => {
    // Affichez le Popup en changeant l'état
    setSelectedWaypointSymbol(waypointSymbol);
    setPopupVisibility(true);
  };

  const handlePopupClose = () => {
    // Masquez le Popup en changeant l'état
    setPopupVisibility(false);
  };

  return (
    <div className="page">
      <Menu />
      {loading ? (
        <Loader />
      ) : (
        <div>
          <h2 id="title">Acheter des vaisseaux :</h2>
          <div className="scan">
            <div className="scanned-results">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Orbits</th>
                    <th>Is Under Construction</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedData?.data.map((waypoint) => (
                    <tr key={waypoint.symbol}>
                      <td>{waypoint.symbol}</td>
                      <td>{waypoint.type}</td>
                      <td>{waypoint.orbits}</td>
                      <td>{waypoint.isUnderConstruction.toString()}</td>
                      <td>
                        <button
                          className="button"
                          onClick={() => handleBuyButtonClick(waypoint.symbol)}
                        >
                          Voir la liste des vaisseaux
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className={`blur-div ${isPopupVisible ? "visible" : "hidden"}`}>
        {isPopupVisible && (
          <PopupAchat
            onClose={handlePopupClose}
            selectedSystemSymbol={systemSymbol}
            selectedWaypointSymbol={selectedWaypointSymbol}
          />
        )}
      </div>
    </div>
  );
}
