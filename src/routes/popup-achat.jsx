import React, { useEffect, useState } from "react";
import "./../styles/popup.css";
import Loader from "./loader";
import Validate from "./validate";

const PopupAchat = ({
  selectedSystemSymbol,
  selectedWaypointSymbol,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [shipyardData, setShipyardData] = useState({});
  const [ships, setShips] = useState([]);
  const [token, setToken] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [noShipsAtShipyard, setNoShipsAtShipyard] = useState(false);
  const [selectedShip, setSelectedShip] = useState("");
  const [yourShips, setYourShips] = useState([]);

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
    const fetchShipyardData = async () => {
      try {
        const response = await fetch(
          `https://api.spacetraders.io/v2/systems/${selectedSystemSymbol}/waypoints/${selectedWaypointSymbol}/shipyard`,
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
          console.log("Shipyard data:", data);
          setShipyardData(data.data);
          setShips(data.data.ships);

          if (!token) {
            console.error("Token manquant. Veuillez vous connecter.");
            return;
          }
          // Vérifier si aucun vaisseau n'est au shipyard
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
            const isShipAtShipyard = myShipsData.data.some(
              (ship) => ship.nav.waypointSymbol === selectedWaypointSymbol
            );

            if (!isShipAtShipyard) {
              setNoShipsAtShipyard(true);
            }
          } else {
            const myShipsError = await myShipsResponse.json();
            console.error(
              "Erreur lors de la récupération des vaisseaux :",
              myShipsError
            );
          }
        } else {
          console.error(
            "Erreur lors de la requête du shipyard. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la requête du shipyard :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipyardData();
  }, [selectedSystemSymbol, selectedWaypointSymbol, token]);

  const handleNavigateButtonClick = async () => {
    try {
      if (!selectedShip) {
        console.error("Veuillez sélectionner un vaisseau.");
        return;
      }

      // Appel API pour la navigation
      const navigateResponse = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${selectedShip}/navigate`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            waypointSymbol: selectedWaypointSymbol,
          }),
        }
      );

      if (navigateResponse.ok) {
        console.log("Navigation réussie !");
        // Ajoutez ici le code pour gérer la navigation réussie
      } else {
        const navigateError = await navigateResponse.json();
        console.error("Erreur lors de la navigation :", navigateError);
      }
    } catch (error) {
      console.error("Erreur lors de la requête de navigation :", error);
    }
  };

  const handleBuyButtonClick = async (shipType) => {
    try {
      // Vérifier si au moins un de vos vaisseaux est déjà au shipyard
      if (noShipsAtShipyard) {
        console.log("Aucun de vos vaisseaux n'est au shipyard.");
        // Ajoutez ici le code pour gérer le cas où aucun vaisseau n'est au shipyard
        return;
      }

      // Procéder à l'achat du vaisseau si au moins un vaisseau est au shipyard
      const buyShipResponse = await fetch(
        "https://api.spacetraders.io/v2/my/ships",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipType: shipType,
            waypointSymbol: selectedWaypointSymbol,
          }),
        }
      );

      if (buyShipResponse.ok) {
        // console.log("Achat réussi !");
        setShowValidate(true);

        // Masquer l'élément Validate après 1 seconde
        setTimeout(() => {
          setShowValidate(false);
        }, 1000);

        // Vous pouvez ajouter ici d'autres actions après l'achat réussi
      } else {
        const responseData = await buyShipResponse.json();
        console.error("Erreur lors de l'achat du vaisseau:", responseData);
      }
    } catch (error) {
      console.error("Erreur lors de la requête d'achat :", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <button onClick={onClose} className="button">
        Fermer
      </button>
      <div className="popupcontainer-container">
        <h3>Liste des vaisseaux au Shipyard :</h3>
        <p>Waypoint Symbol: {shipyardData.symbol}</p>

        {noShipsAtShipyard ? (
          <div>
            <p style={{ color: "red" }}>
              Aucun de vos vaisseaux n'est au shipyard.
            </p>
            <label htmlFor="selectShip">Sélectionner un vaisseau : </label>
            <select
              className="select"
              id="selectShip"
              onChange={(e) => setSelectedShip(e.target.value)}
            >
              <option value="">Sélectionnez un vaisseau</option>
              {yourShips.map((ship) => (
                <option key={ship.symbol} value={ship.symbol}>
                  {ship.symbol}
                </option>
              ))}
            </select>
            <button className="button" onClick={handleNavigateButtonClick}>
              Envoyer un vaisseau
            </button>
          </div>
        ) : null}

        <table>
          <thead>
            <tr>
              <th>Ship Type</th>
              <th>Description</th>
              <th>Prix</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ships && ships.length > 0 ? (
              ships.map((ship) => (
                <tr key={ship.type}>
                  <td>{ship.name}</td>
                  <td>{ship.description}</td>
                  <td>{ship.purchasePrice}</td>
                  <td>
                    <button
                      className={`button ${
                        noShipsAtShipyard ? "disabled" : ""
                      }`}
                      onClick={() => handleBuyButtonClick(ship.type)}
                      disabled={noShipsAtShipyard}
                    >
                      Acheter
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Aucun vaisseau disponible.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showValidate && <Validate />}{" "}
      {/* Affiche l'élément Validate si showValidate est true */}
    </div>
  );
};

export default PopupAchat;
