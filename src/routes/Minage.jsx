import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Loader from "./Loader";
import "./../styles/info-navigation.css";

const Minage = () => {
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
      <div className="InfoNav"></div>
    </div>
  );
};

export default Minage;
