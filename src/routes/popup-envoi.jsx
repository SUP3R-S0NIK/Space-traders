import React, { useEffect, useState } from "react";
import "./../styles/popup.css";
import Loader from "./loader";

const Popup_envoi = ({ selectedShipSymbol, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState("");
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch("https://api.spacetraders.io/v2/systems", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("System data:", data);
          setSystems(data.data);
        } else {
          console.error(
            "Erreur lors de la requête des systèmes. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la requête des systèmes :", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchSystemData();
  }, []);

  useEffect(() => {
    const fetchWaypointsData = async () => {
      if (selectedSystem) {
        try {
          const response = await fetch(
            `https://api.spacetraders.io/v2/systems/${selectedSystem}/waypoints`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Waypoints data:", data);
            setWaypoints(data.data); // Fix: use data.data instead of data.waypoints
          } else {
            console.error(
              "Erreur lors de la requête des waypoints. Veuillez réessayer."
            );
          }
        } catch (error) {
          console.error("Erreur lors de la requête des waypoints :", error);
        }
      }
    };

    fetchWaypointsData();
  }, [selectedSystem]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="popup-div">
      <button onClick={onClose} className="button">
        Fermer
      </button>
      <div className="popupcontainer-container ">
        <section className="section-popup symbol">
          <label>Symbol du vaisseau :</label>
          <p>{selectedShipSymbol}</p>
        </section>
        <h3>Envoyer vers : </h3>
        <section className="section-popup">
          <label htmlFor="systeme">Système :</label>
          <select
            className="select"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
          >
            <option value="" disabled>
              Sélectionnez un système
            </option>
            {systems.map((system) => (
              <option key={system.symbol} value={system.symbol}>
                {system.symbol}
              </option>
            ))}
          </select>
        </section>
        <label>Waypoint :</label>
        <section className="section-popup-table">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Faction</th>
                <th>Orbits</th>
                <th>Is Under Construction</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {waypoints.map((waypoint) => (
                <tr key={waypoint.symbol}>
                  <td>{waypoint.symbol}</td>
                  <td>{waypoint.type}</td>
                  <td>{waypoint.faction?.symbol || "N/A"}</td>
                  <td>{waypoint.orbits}</td>
                  <td>{waypoint.isUnderConstruction?.toString() || "N/A"}</td>
                  <td>
                    <input
                      type="radio"
                      name="selectedWaypoint"
                      value={waypoint.symbol}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Popup_envoi;
