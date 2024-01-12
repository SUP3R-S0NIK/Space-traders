import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/ship.css";
import Menu from "./Menu";
import Loader from "./loader";
import Popup from "./popup-envoi";

export default function Vaisseaux() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [ships, setShips] = useState([]);
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [selectedShipSymbol, setSelectedShipSymbol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les données depuis le localStorage
    const storedToken = localStorage.getItem("token");

    setToken(storedToken);

    // Vous pouvez également effectuer une nouvelle requête à l'API pour obtenir les informations mises à jour si nécessaire
    // Assurez-vous de gérer correctement les erreurs et les cas où le token n'est pas valide
  }, []);

  useEffect(() => {
    const fetchShipsData = async () => {
      try {
        const response = await fetch(
          "https://api.spacetraders.io/v2/my/ships",
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
          setShips(data.data);
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

    fetchShipsData();
  }, [token]);

  const handleShipButtonClick = (shipSymbol) => {
    // Redirigez vers "/navigate" avec le symbole du vaisseau sélectionné
    navigate("/vaisseau");
    // Mettez à jour le symbole du vaisseau sélectionné dans l'état
    setSelectedShipSymbol(shipSymbol);
    // Stockez le symbole du vaisseau dans le localStorage
    localStorage.setItem("selectedShipSymbol", shipSymbol);
  };

  const handlePopupClose = () => {
    // Masquez le Popup en changeant l'état
    setPopupVisibility(false);
  };

  const handleStatusChange = async (shipSymbol, currentStatus) => {
    try {
      const newStatus = currentStatus === "DOCKED" ? "IN_ORBIT" : "DOCKED";

      // Mettez à jour localement le statut du vaisseau
      const updatedShips = ships.map((ship) =>
        ship.symbol === shipSymbol
          ? { ...ship, nav: { ...ship.nav, status: newStatus } }
          : ship
      );

      setShips(updatedShips); // Mettez à jour l'état local avant la requête à l'API

      // Ensuite, envoyez la requête à l'API
      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipSymbol}/${
          newStatus === "DOCKED" ? "dock" : "orbit"
        }`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Erreur lors de la requête. Veuillez réessayer.");
        // Si la requête échoue, annulez la mise à jour locale
        setShips((prevShips) => prevShips.map((ship) => ({ ...ship })));
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
    }
  };
  const handleInfoButtonClick = (shipSymbol) => {
    // Redirigez vers "/navigate" avec le symbole du vaisseau sélectionné
    navigate("/info-nav");
    // Mettez à jour le symbole du vaisseau sélectionné dans l'état
    setSelectedShipSymbol(shipSymbol);
    // Stockez le symbole du vaisseau dans le localStorage
    localStorage.setItem("shipInfoNav", shipSymbol);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <Menu />
      <div>
        <h2 id="title">Liste des vaisseaux :</h2>
        <div className="list">
          <button className="button" onClick={() => navigate("/buy_vaisseaux")}>
            Acheter un vaisseau
          </button>
          <table>
            <thead>
              <tr>
                <th>Nom du vaisseau</th>
                <th>Type de vaisseau</th>
                <th>Statut du vaisseau</th>
                <th>Système</th>
                <th>Waypoint</th>
                <th>Capacité du vaisseau</th>
                <th>Essence du vaisseau</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((ship) => (
                <tr key={ship.symbol}>
                  <td>{ship.registration.name}</td>
                  <td>{ship.frame.name}</td>
                  <td>
                    <button
                      className={`button send-button ${
                        ship.nav.status === "IN_TRANSIT" ? "disabled" : ""
                      }`}
                      disabled={ship.nav.status === "IN_TRANSIT"}
                      onClick={() =>
                        handleStatusChange(ship.symbol, ship.nav.status)
                      }
                    >
                      {ship.nav.status}
                    </button>
                  </td>
                  <td>{ship.nav.systemSymbol}</td>
                  <td>{ship.nav.waypointSymbol}</td>
                  <td>
                    <div className="bar">
                      <p>
                        {ship.cargo.units} / {ship.cargo.capacity}
                      </p>
                      <progress
                        value={ship.cargo.units}
                        max={ship.cargo.capacity}
                      ></progress>
                    </div>
                  </td>
                  <td>
                    <div className="bar">
                      <p>
                        {ship.fuel.current} / {ship.fuel.capacity}
                      </p>
                      <progress
                        value={ship.fuel.current}
                        max={ship.fuel.capacity}
                      >
                        {ship.fuel.current}
                      </progress>
                    </div>
                  </td>
                  <td>
                    <button
                      className="button send-button"
                      onClick={() => handleShipButtonClick(ship.symbol)}
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={`blur-div ${isPopupVisible ? "visible" : "hidden"}`}>
        {isPopupVisible && (
          <Popup
            onClose={handlePopupClose}
            selectedShipSymbol={selectedShipSymbol}
          />
        )}
      </div>
    </div>
  );
}
