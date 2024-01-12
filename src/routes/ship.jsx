// Importez useState, useEffect depuis React
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Loader from "./loader";
import "./../styles/ship.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MarketplacePage from "./popupmarket";
import Validate from "./validate";

const calculateTimeRemaining = (arrivalTime, setTimeRemaining) => {
  const intervalId = setInterval(() => {
    const currentTime = new Date().getTime();
    const arrivalTimestamp = new Date(arrivalTime).getTime();
    const remainingTime = arrivalTimestamp - currentTime;

    if (remainingTime > 0) {
      const hours = Math.floor(
        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    } else {
      clearInterval(intervalId);
      setTimeRemaining(null);
    }
  }, 1000);

  return () => clearInterval(intervalId);
};

const calculatePercentRemaining = (departureTime, setTimeRemaining) => {
  const intervalId = setInterval(() => {
    const currentTime = new Date().getTime();
    const departureTimestamp = new Date(departureTime).getTime();
    const remainingTime = currentTime - departureTimestamp;
    // console.log(currentTime);

    if (remainingTime > 0) {
      const hours = Math.floor(
        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    } else {
      clearInterval(intervalId);
      setTimeRemaining(null);
    }
  }, 1000);

  return () => clearInterval(intervalId);
};
const convertArrivalTime = (arrivalTime) => {
  const arrivalTimestamp = new Date(arrivalTime).getTime();

  const hours = Math.floor(
    (arrivalTimestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (arrivalTimestamp % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((arrivalTimestamp % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

const convertDepartureTime = (DepartureTime) => {
  const departureTimestamp = new Date(DepartureTime).getTime();

  const hours = Math.floor(
    (departureTimestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (departureTimestamp % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((departureTimestamp % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

const ShipPage = () => {
  const [shipData, setShipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [selectedShip, setSelectedShip] = useState("");
  const [waypointData, setWaypointData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [percentRemaining, setPercentRemaining] = useState(null);
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [showValidate, setShowValidate] = useState(false);
  const [arrivalTimeDetails, setArrivalTimeDetails] = useState(null);
  const [departureTimestamp, setDepartureTimestampDetails] = useState(null);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: fr });
  };
  const navigate = useNavigate();
  const [cooldownIntervalId, setCooldownIntervalId] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const updateCooldownRemaining = (remainingSeconds) => {
    setCooldownRemaining(remainingSeconds);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");

    const storedShipSymbol = localStorage.getItem("selectedShipSymbol");
    if (storedShipSymbol) {
      setSelectedShip(storedShipSymbol);
    }
  }, []);

  useEffect(() => {
    if (selectedShip) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `https://api.spacetraders.io/v2/my/ships/${selectedShip}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            console.error(
              "Erreur lors de la récupération des données du vaisseau"
            );
            return;
          }

          const data = await response.json();

          const arrivalTimeDetails = convertArrivalTime(
            data.data.nav.route.arrival
          );
          setArrivalTimeDetails(arrivalTimeDetails);

          const departureTimeDetails = convertArrivalTime(
            data.data.nav.route.departureTime
          );
          // console.log(departureTimeDetails);
          setDepartureTimestampDetails(departureTimeDetails);

          const cleanup = calculateTimeRemaining(
            data.data.nav.route.arrival,
            setTimeRemaining
          );
          const cleanup2 = calculatePercentRemaining(
            data.data.nav.route.departureTime,
            setPercentRemaining
          );

          setShipData(data.data);
          setCooldownRemaining(data.data.cooldown.remainingSeconds);
          // Mettez à jour le cooldown et activez le compteur
          updateCooldownRemaining(data.data.cooldown.remainingSeconds);
          startCooldownCounter(data.data.cooldown.remainingSeconds);

          // Ajout de la requête pour obtenir les détails du waypoint
          const waypointResponse = await fetch(
            `https://api.spacetraders.io/v2/systems/${data.data.nav.systemSymbol}/waypoints/${data.data.nav.waypointSymbol}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (waypointResponse.ok) {
            const waypointData = await waypointResponse.json();
            setWaypointData(waypointData.data);
          } else {
            console.error(
              "Erreur lors de la récupération des données du waypoint"
            );
          }

          setTimeout(() => {
            setLoading(false);
          }, 1000);
          return () => {
            cleanup();
            cleanup2();
            clearInterval(cooldownIntervalId);
          };
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [token, selectedShip, cooldownIntervalId]);

  const handleStatusChange = async (shipSymbol, currentStatus) => {
    try {
      const newStatus = currentStatus === "DOCKED" ? "IN_ORBIT" : "DOCKED";

      // Vérifiez si shipData est défini
      if (shipData) {
        // Mettez à jour localement le statut du vaisseau
        const updatedShip = {
          ...shipData,
          nav: { ...shipData.nav, status: newStatus },
        };

        setShipData(updatedShip);

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
          setShipData(shipData); // Rétablissez l'état précédent
        }
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
    }
  };

  const handleRefuel = async () => {
    try {
      if (
        !waypointData.traits.some((trait) => trait.symbol === "MARKETPLACE") ||
        !shipData.nav.status.includes("DOCKED")
      ) {
        // Si le bouton est désactivé, ne rien faire
        return;
      }

      const unitsToRefuel = shipData.fuel.capacity - shipData.fuel.current;
      // console.log(unitsToRefuel);

      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipData.symbol}/refuel`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            units: unitsToRefuel.toString(),
            fromCargo: false,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Erreur lors de la requête de ravitaillement. Veuillez réessayer."
        );
        return;
      }

      // Mettez à jour les données du vaisseau après le ravitaillement réussi
      const updatedShipData = {
        ...shipData,
        fuel: { ...shipData.fuel, current: shipData.fuel.capacity },
      };
      setShipData(updatedShipData);

      // console.log("Ravitaillement réussi !");
      setShowValidate(true);

      // Masquer l'élément Validate après 1 seconde
      setTimeout(() => {
        setShowValidate(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la requête de ravitaillement :", error);
    }
  };

  const handleExcavate = async () => {
    try {
      // Effectuez la requête pour extraire les ressources
      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipData.symbol}/extract`,
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
        console.error(
          "Erreur lors de la requête d'excavation. Veuillez réessayer."
        );
        return;
      }

      // Effectuez une deuxième requête pour obtenir les données mises à jour du vaisseau
      const updatedResponse = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipData.symbol}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updatedResponse.ok) {
        console.error(
          "Erreur lors de la récupération des données du vaisseau après extraction."
        );
        return;
      }

      const updatedData = await updatedResponse.json();

      // Mettez à jour l'état avec les nouvelles données
      setShipData(updatedData.data);

      // Mettez à jour le cooldown et activez le compteur
      updateCooldownRemaining(updatedData.data.cooldown.remainingSeconds);

      // Obtenez l'identifiant de l'intervalle de startCooldownCounter
      const cooldownIntervalId = startCooldownCounter(
        updatedData.data.cooldown.remainingSeconds
      );

      // Stockez l'identifiant de l'intervalle dans un state
      setCooldownIntervalId(cooldownIntervalId);

      // console.log("Excavation réussie !");
      setShowValidate(true);

      // Masquer l'élément Validate après 1 seconde
      setTimeout(() => {
        setShowValidate(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la requête d'excavation :", error);
    }
  };

  const startCooldownCounter = (remainingSeconds) => {
    setCooldownRemaining(remainingSeconds);

    return setInterval(() => {
      if (remainingSeconds > 0) {
        setCooldownRemaining((prevRemaining) => prevRemaining - 1);
      } else {
        clearInterval;
      }
    }, 1000);
  };

  const handleSellGoods = async () => {
    try {
      // Vérifiez si le bouton est désactivé
      if (
        !waypointData.traits.some((trait) => trait.symbol === "MARKETPLACE") ||
        !shipData.nav.status.includes("DOCKED")
      ) {
        // console.log(
        //   "Le bouton est désactivé. Impossible de vendre des marchandises."
        // );

        return;
      }

      setPopupVisibility(true);
      // Faites quelque chose avec les données du marché (marketData) ici
      // console.log("Données du marché :", marketData);
    } catch (error) {
      console.error(
        "Erreur lors de la requête de vente de marchandises :",
        error
      );
    }
  };

  const handleSendButtonClick = (shipSymbol) => {
    // Redirigez vers "/navigate" avec le symbole du vaisseau sélectionné
    navigate("/navigate");
    // Mettez à jour le symbole du vaisseau sélectionné dans l'état
    setSelectedShipSymbol(shipSymbol);
    // Stockez le symbole du vaisseau dans le localStorage
    localStorage.setItem("selectedShipSymbol", shipSymbol);
  };

  const handlePopupClose = () => {
    // Masquez le Popup en changeant l'état
    setPopupVisibility(false);
    window.location.reload();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <Menu />
      <div className="dashboard-ship">
        <h2 id="title">{shipData.symbol}</h2>
        <div className="container">
          <div className="info info-ship">
            <h3>Nom du vaisseau : {shipData.symbol}</h3>
            <div className="info-ship-value">
              <div className="info-ship-jaugeDiv">
                <section className="info-ship-jaugeSection">
                  <p>Fuel</p>
                  <p>
                    {shipData.fuel.current} / {shipData.fuel.capacity}
                  </p>
                </section>
                <progress
                  value={shipData.fuel.current}
                  max={shipData.fuel.capacity}
                >
                  {shipData.fuel.current}
                </progress>
              </div>
              <button
                className={`button ${
                  !waypointData.traits.some(
                    (trait) => trait.symbol === "MARKETPLACE"
                  ) || !shipData.nav.status.includes("DOCKED")
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  !waypointData.traits.some(
                    (trait) => trait.symbol === "MARKETPLACE"
                  ) || !shipData.nav.status.includes("DOCKED")
                }
                onClick={() => handleRefuel()}
              >
                Refuel
              </button>
            </div>
            <div className="info-ship-value">
              <div className="info-ship-jaugeDiv">
                <section className="info-ship-jaugeSection">
                  <p>Cargo stockage</p>
                  <p>
                    {shipData.cargo.units} / {shipData.cargo.capacity}
                  </p>
                </section>

                <progress
                  value={shipData.cargo.units}
                  max={shipData.cargo.capacity}
                ></progress>
              </div>
              <button
                className={`button ${
                  !shipData.nav.status.includes("DOCKED") &&
                  waypointData.type &&
                  ["ASTEROID", "ASTEROID_FIELD", "ENGINEERED_ASTEROID"].some(
                    (type) => waypointData.type === type
                  ) &&
                  shipData.cooldown.remainingSeconds === 0 &&
                  shipData.cargo.units < shipData.cargo.capacity
                    ? ""
                    : "disabled"
                }`}
                disabled={
                  shipData.nav.status.includes("DOCKED") ||
                  !waypointData.type ||
                  !["ASTEROID", "ASTEROID_FIELD", "ENGINEERED_ASTEROID"].some(
                    (type) => waypointData.type === type
                  ) ||
                  shipData.cooldown.remainingSeconds > 0 ||
                  shipData.cargo.units >= shipData.cargo.capacity
                }
                onClick={() => handleExcavate()}
              >
                Excavate
              </button>
            </div>
            <p>Cooldown excavate : {cooldownRemaining}s</p>
          </div>
          <div className="info info-position">
            <h3>Position actuelle : {shipData.nav.waypointSymbol}</h3>
            <div className="info-position-traitsDiv">
              {waypointData ? (
                <>
                  <p>
                    {waypointData.traits.map((trait, index) => (
                      <span className="Traits" key={index}>
                        {trait.symbol}
                      </span>
                    ))}
                  </p>
                  <div>
                    <button
                      className={`button ${
                        !waypointData.traits.some(
                          (trait) => trait.symbol === "MARKETPLACE"
                        ) || !shipData.nav.status.includes("DOCKED")
                          ? "disabled"
                          : ""
                      }`}
                      disabled={
                        !waypointData.traits.some(
                          (trait) => trait.symbol === "MARKETPLACE"
                        ) || !shipData.nav.status.includes("DOCKED")
                      }
                      onClick={() => handleSellGoods()}
                    >
                      Vendre marchandises
                    </button>
                    <button
                      className={`button ${
                        !waypointData.traits.some(
                          (trait) => trait.symbol === "SHIPYARD"
                        ) || !shipData.nav.status.includes("DOCKED")
                          ? "disabled"
                          : ""
                      }`}
                      disabled={
                        !waypointData.traits.some(
                          (trait) => trait.symbol === "SHIPYARD"
                        ) || !shipData.nav.status.includes("DOCKED")
                      }
                    >
                      Acheter un vaisseau
                    </button>
                  </div>
                </>
              ) : (
                "Chargement des données du waypoint..."
              )}
            </div>
          </div>
          <div className="info info-statut">
            <h3>Statut du vaisseau : </h3>
            <div className="info-statut-dock">
              <p>Votre vaisseau est acutellement : </p>
              <button
                className={`button send-button ${
                  shipData.nav.status === "IN_TRANSIT" ? "disabled" : ""
                }`}
                disabled={shipData.nav.status === "IN_TRANSIT"}
                onClick={() =>
                  handleStatusChange(shipData.symbol, shipData.nav.status)
                }
              >
                {shipData.nav.status}
              </button>
            </div>
            {shipData.nav.status === "IN_TRANSIT" ? (
              <div className="info-statut-dock">
                <div>
                  <h3>Info Navigation : </h3>
                  <p>
                    Arrivée prévue :{" "}
                    {new Date(shipData.nav.route.arrival).toLocaleString()}
                  </p>
                  <p>
                    Temps restant :{" "}
                    {timeRemaining
                      ? `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
                      : "N/A"}
                  </p>
                  {timeRemaining && (
                    <div className="progressBar">
                      <div
                        className="progressFill"
                        style={{
                          width: `${calculateProgress(
                            percentRemaining,
                            arrivalTimeDetails,
                            departureTimestamp
                          )}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="info-statut-dock">
                  <button
                    className={`button send-button ${
                      shipData.nav.status === "DOCKED" ? "disabled" : ""
                    }`}
                    onClick={() => handleSendButtonClick(shipData.symbol)}
                    disabled={shipData.nav.status === "DOCKED"}
                  >
                    Envoyer vers
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="info info-cargo">
            <h3>Cargo du vaisseau</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantité</th>
                </tr>
              </thead>
              <tbody>
                {shipData.cargo.inventory.map((item) => (
                  <tr key={item.symbol}>
                    <td>{item.name}</td>
                    <td>{item.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className={`blur-div ${isPopupVisible ? "visible" : "hidden"}`}>
        {waypointData &&
          waypointData.traits.some(
            (trait) => trait.symbol === "MARKETPLACE"
          ) && (
            <MarketplacePage
              onClose={handlePopupClose}
              systemSymbol={shipData.nav.systemSymbol}
              waypointSymbol={waypointData.symbol}
            />
          )}
      </div>
    </div>
  );
};

const calculateProgress = (
  timeRemaining,
  arrivalTimeDetails,
  departureTimestamp
) => {
  const remaining =
    timeRemaining.hours * 3600 +
    timeRemaining.minutes * 60 +
    timeRemaining.seconds;

  // console.log("remaining:", remaining);
  const totalTime =
    arrivalTimeDetails.hours * 3600 +
    arrivalTimeDetails.minutes * 60 +
    arrivalTimeDetails.seconds;

  const elapsedTime =
    (arrivalTimeDetails.hours - timeRemaining.hours) * 3600 +
    (arrivalTimeDetails.minutes - timeRemaining.minutes) * 60 +
    (arrivalTimeDetails.seconds - timeRemaining.seconds);

  const departureTime =
    departureTimestamp.hours * 3600 +
    departureTimestamp.minutes * 60 +
    departureTimestamp.seconds;

  const arrivalTime =
    arrivalTimeDetails.hours * 3600 +
    arrivalTimeDetails.minutes * 60 +
    arrivalTimeDetails.seconds;

  //console.log(departureTime);
  // console.log(arrivalTime);
  //console.log(remaining);
  // console.log(arrivalTime - departureTime);

  const progressPercentage = (remaining * 100) / (arrivalTime - departureTime);
  // console.log(progressPercentage);
  return progressPercentage;
};

export default ShipPage;
