import React, { useEffect, useState } from "react";
import "./../styles/popup.css";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";

const PopupWaypoint = ({ selectedWaypoint, selectedSystem, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [waypointData, setwaypointData] = useState({});
  const [ships, setShips] = useState([]);
  const [token, setToken] = useState("");
  const [yourShips, setYourShips] = useState([]); // Ajout de l'état yourShips
  const [selectedWaypointSymbol, setSelectedWaypointSymbol] = useState(null);
  const [showValidate, setShowValidate] = useState(false);
  const [noShipsAtwaypoint, setNoShipsAtwaypoint] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");
  }, []);

  useEffect(() => {
    const fetchYourShips = async () => {
      try {
        if (!token) {
          console.error("Token manquant. Veuillez vous connecter.");
          return;
        }

        const myShipsResponse = await fetch(
          "https://api.spacetraders.io/v2/my/ships",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (myShipsResponse.ok) {
          const myShipsData = await myShipsResponse.json();
          setYourShips(myShipsData.data);
        } else {
          const myShipsError = await myShipsResponse.json();
          console.error(
            "Erreur lors de la récupération des vaisseaux :",
            myShipsError
          );
        }
      } catch (error) {
        console.error("Erreur lors de la requête des vaisseaux :", error);
      }
    };

    fetchYourShips();
  }, [token]);

  useEffect(() => {
    const fetchwaypointData = async () => {
      try {
        const response = await fetch(
          `https://api.spacetraders.io/v2/systems/${selectedSystem}/waypoints/${selectedWaypoint}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("waypoint data:", data);
          setwaypointData(data.data);
          setShips(data.data.shipTypes);
          console.log(waypointData.type);
          // Vérifier si aucun vaisseau n'est au waypoint
          const isShipAtwaypoint = yourShips.some(
            (ship) => ship.nav?.waypointSymbol === selectedWaypoint
          );

          setNoShipsAtwaypoint(!isShipAtwaypoint);
        } else {
          console.error(
            "Erreur lors de la requête du waypoint. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la requête du waypoint :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchwaypointData();
  }, [selectedSystem, selectedWaypoint, token, yourShips]);

  const handleSendButtonClick = (waypointSymbol, waypointType) => {
    // Redirigez vers "/navigate" avec le symbole du vaisseau sélectionné
    navigate("/navigate");
    // Mettez à jour le symbole du vaisseau sélectionné dans l'état

    // Stockez le symbole du vaisseau dans le localStorage
    localStorage.setItem("selectedWaypointSymbol", waypointSymbol);
    localStorage.setItem("selectedWaypointType", waypointType);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="popup-div">
      <button onClick={onClose} className="button">
        Fermer
      </button>
      <div className="popupcontainer-container">
        <h3>Waypoint : {selectedWaypoint}</h3>
        {/* Afficher les informations du waypoint */}
        <p>Symbol: {waypointData.symbol}</p>
        <p>Type: {waypointData.type}</p>

        <p>
          Caractéristiques :
          {waypointData.traits && waypointData.traits.length > 0 ? (
            <table className="table-waypoint">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Nom</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {waypointData.traits.map((trait) => (
                  <tr key={trait.symbol}>
                    <td>{trait.symbol}</td>
                    <td>{trait.name}</td>
                    <td>{trait.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            "Aucune caractéristique disponible"
          )}
        </p>

        {noShipsAtwaypoint ? (
          <div>
            <p style={{ color: "red" }}>
              Aucun de vos vaisseaux n'est au waypoint.
            </p>
            <label htmlFor="selectShip">Sélectionner un vaisseau : </label>

            <button
              className="button"
              onClick={() =>
                handleSendButtonClick(waypointData.symbol, waypointData.type)
              }
            >
              Envoyer un vaisseau
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PopupWaypoint;
