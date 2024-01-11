import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Loader from "./loader";
import "./../styles/info-navigation.css";

const calculateTimeRemaining = (
  arrivalTime,
  setTimeRemaining,
  setShowMiningButton
) => {
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
      setShowMiningButton(true);
    }
  }, 1000);

  return () => clearInterval(intervalId);
};

const calculatePercentRemaining = (departureTime, setTimeRemaining) => {
  const intervalId = setInterval(() => {
    const currentTime = new Date().getTime();
    const departureTimestamp = new Date(departureTime).getTime();
    const remainingTime = currentTime - departureTimestamp;

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

const ShipStatusPage = () => {
  const [shipData, setShipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [percentRemaining, setPercentRemaining] = useState(null);
  const [arrivalTimeDetails, setArrivalTimeDetails] = useState(null);
  const [departureTimestamp, setDepartureTimestampDetails] = useState(null);
  const [selectedShip, setSelectedShip] = useState("");
  const [showMiningButton, setShowMiningButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");

    const storedShipSymbol = localStorage.getItem("shipInfoNav");
    if (storedShipSymbol) {
      setSelectedShip(storedShipSymbol);
    }
  }, []);

  useEffect(() => {
    if (selectedShip) {
      const fetchShipData = async () => {
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

          setShipData(data.data);

          const arrivalTimeDetails = convertArrivalTime(
            data.data.nav.route.arrival
          );
          setArrivalTimeDetails(arrivalTimeDetails);

          const departureTimeDetails = convertArrivalTime(
            data.data.nav.route.departureTime
          );
          setDepartureTimestampDetails(departureTimeDetails);

          const cleanup = calculateTimeRemaining(
            data.data.nav.route.arrival,
            setTimeRemaining,
            setShowMiningButton
          );
          const cleanup2 = calculatePercentRemaining(
            data.data.nav.route.departureTime,
            setPercentRemaining
          );

          setTimeout(() => {
            setLoading(false);
          }, 1000);

          return () => {
            cleanup();
            cleanup2();
          };
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchShipData();
    }
  }, [token, selectedShip]);

  const handleMiningButtonClick = () => {
    navigate("/miner");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <Menu />
      <div className="InfoNav">
        {shipData ? (
          <>
            <h2>Statut du vaisseau {shipData.symbol}</h2>
            {showMiningButton && (
              <button className="button" onClick={handleMiningButtonClick}>
                Aller miner (ou un libellé approprié)
              </button>
            )}
            <p>Système actuel : {shipData.nav.systemSymbol}</p>
            <p>Prochain waypoint : {shipData.nav.waypointSymbol}</p>
            <p>
              Arrivée prévue :{" "}
              {new Date(shipData.nav.route.arrival).toLocaleString()}
            </p>
            <p>Statut : {shipData.nav.status}</p>
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
          </>
        ) : (
          <div>Les données du vaisseau ne sont pas disponibles.</div>
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
  //   console.log("remaining:", remaining);
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

  //   console.log(departureTime);
  //   console.log(arrivalTime);

  const progressPercentage = (remaining * 100) / (arrivalTime - departureTime);
  console.log(progressPercentage);
  return progressPercentage;
};

export default ShipStatusPage;
