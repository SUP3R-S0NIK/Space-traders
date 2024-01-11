import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/navigation.css";
import Menu from "./Menu";
import Loader from "./Loader";
import Validate from "./validate";

const Navigate = ({ shipSymbol }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [systemSymbol, setSystemSymbol] = useState("");
  const [ships, setShips] = useState([]);
  const [shipyards, setShipyards] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);
  const [selectedWaypointType, setSelectedWaypointType] = useState("");
  const [selectedWaypoint, setSelectedWaypoint] = useState("");
  const [selectedShip, setSelectedShip] = useState("  ");
  const [distance, setDistance] = useState(null);
  const [tripDuration, setTripDuration] = useState(null);
  const [showValidate, setShowValidate] = useState(false);
  const navigate = useNavigate();
  const [selectedWaypointDetails, setSelectedWaypointDetails] = useState(null);
  const isAnySelectorEmpty =
    !selectedShip || !selectedWaypointType || !selectedWaypoint;
  const [alreadyOnWaypointMessage, setAlreadyOnWaypointMessage] = useState("");

  useEffect(() => {
    // Récupérer les données depuis le localStorage
    const storedToken = localStorage.getItem("token");
    const storedSystemSymbol = localStorage.getItem("systemSymbol");
    const selectedShipPage = localStorage.getItem("selectedShipSymbol");
    const selectedWaypointPage = localStorage.getItem("selectedWaypointSymbol");

    setToken(storedToken || "");
    setSystemSymbol(storedSystemSymbol || "");
    setSelectedShip(selectedShipPage || "");
    setSelectedWaypoint(selectedWaypointPage || "");

    // Vous pouvez également effectuer une nouvelle requête à l'API pour obtenir les informations mises à jour si nécessaire
    // Assurez-vous de gérer correctement les erreurs et les cas où le token n'est pas valide
  }, []);
  console.log(selectedShip);
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
        setLoading(false);
      }
    };

    fetchShipsData();
  }, [token]);

  const fetchWaypointsData = async (waypointType, page = 1) => {
    let endpoint = "";
    let allWaypoints = [];

    if (waypointType === "Shipyard") {
      endpoint = `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=SHIPYARD`;
    } else if (waypointType === "Marketplace") {
      endpoint = `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=MARKETPLACE&page=${page}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        allWaypoints = allWaypoints.concat(data.data);

        // Vérifiez si la longueur des données est inférieure à la limite par page
        const itemsPerPage = data.meta?.limit || 10; // Remplacez 10 par la limite réelle par page si différente
        if (data.data.length === itemsPerPage) {
          // Appel récursif pour récupérer les pages suivantes
          const nextPageData = await fetchWaypointsData(waypointType, page + 1);
          allWaypoints = allWaypoints.concat(nextPageData);
        }
      } else {
        console.error(
          "Erreur lors de la requête des waypoints. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la requête des waypoints :", error);
    }

    return allWaypoints;
  };

  const fetchShipDetails = async (selectedShip) => {
    try {
      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${selectedShip}`,
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
        return data.data;
      } else {
        console.error(
          "Erreur lors de la requête des détails du vaisseau. Veuillez réessayer."
        );
        return null;
      }
    } catch (error) {
      console.error(
        "Erreur lors de la requête des détails du vaisseau :",
        error
      );
      return null;
    }
  };

  const fetchWaypointDetails = async (selectedWaypoint) => {
    try {
      const response = await fetch(
        `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints/${selectedWaypoint}`,
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
        return data.data;
      } else {
        console.error(
          "Erreur lors de la requête des détails du waypoint. Veuillez réessayer."
        );
        return null;
      }
    } catch (error) {
      console.error(
        "Erreur lors de la requête des détails du waypoint :",
        error
      );
      return null;
    }
  };

  const handleWaypointTypeChange = (event) => {
    const selectedType = event.target.value;
    setSelectedWaypointType(selectedType);
    setSelectedWaypoint("");
  };

  const handleWaypointChange = async () => {
    // Récupérer les détails du vaisseau
    const shipDetails = await fetchShipDetails(selectedShip);

    // Récupérer les détails du waypoint
    const waypointDetails = await fetchWaypointDetails(selectedWaypoint);

    if (shipDetails && waypointDetails) {
      // Utilisez maintenant les coordonnées pour calculer la distance
      const distance = calculateDistance(
        shipDetails.nav.route.origin,
        waypointDetails
      );

      // Mettre à jour la variable d'état distance avec la distance calculée
      setDistance(distance);

      // Vérifier si le vaisseau est déjà sur le waypoint
      if (distance === 0) {
        setAlreadyOnWaypointMessage("Ce vaisseau est déjà sur ce waypoint.");
      } else {
        setAlreadyOnWaypointMessage(""); // Réinitialiser le message s'il n'est pas déjà sur le waypoint
      }

      // Stocker l'objet complet du vaisseau et les détails du waypoint
      setSelectedWaypointDetails(waypointDetails);
    }
  };

  const calculateDistance = (point1, point2) => {
    const distanceX = Math.abs(point1.x - point2.x);
    const distanceY = Math.abs(point1.y - point2.y);
    return Math.sqrt(distanceX ** 2 + distanceY ** 2);
  };

  useEffect(() => {
    if (
      selectedShip &&
      selectedWaypoint &&
      selectedShip.nav &&
      selectedShip.nav.route
    ) {
      const waypoint =
        shipyards.find((s) => s.symbol === selectedWaypoint) ||
        marketplaces.find((m) => m.symbol === selectedWaypoint);

      if (waypoint) {
        const distance = calculateDistance(
          selectedShip.nav.route.origin,
          waypoint
        );
        setDistance(distance);
      }
    }
  }, [selectedShip, selectedWaypoint, shipyards, marketplaces]);

  useEffect(() => {
    // Mettez à jour la durée du trajet lorsque la distance ou les détails du vaisseau changent
    const updateTripDuration = async () => {
      if (distance !== null && selectedShip) {
        try {
          const shipDetails = await fetchShipDetails(selectedShip);
          const engineSpeed = shipDetails.engine.speed;
          const multiplier = 25; // Valeur de base du multiplicateur

          // Calcul de la durée du trajet
          const duration = Math.round(
            Math.round(Math.max(1, distance)) * (multiplier / engineSpeed) + 15
          );

          setTripDuration(duration);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des détails du vaisseau :",
            error
          );
        }
      }
    };

    updateTripDuration();
  }, [distance, selectedShip]);

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
            waypointSymbol: selectedWaypoint,
          }),
        }
      );

      if (navigateResponse.ok) {
        console.log("Navigation réussie !");
        setShowValidate(true);

        // Masquer l'élément Validate après 1 seconde
        setTimeout(() => {
          setShowValidate(false);
        }, 1000);
        navigate("/info-nav");
        // Mettez à jour le symbole du vaisseau sélectionné dans l'état

        // Stockez le symbole du vaisseau dans le localStorage
        localStorage.setItem("shipInfoNav", selectedShip);
        localStorage.setItem("shipInfoNav", selectedShip);
        // Ajoutez ici le code pour gérer la navigation réussie
      } else {
        const navigateError = await navigateResponse.json();
        console.error("Erreur lors de la navigation :", navigateError);
      }
    } catch (error) {
      console.error("Erreur lors de la requête de navigation :", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <Menu />
      <h2 id="title">Navigation</h2>
      <div className="navigation-div">
        <div className="navigation-form">
          <section className="navigation-div-select vaisseaux-div">
            <button
              className="button button-nav"
              onClick={() => navigate("/vaisseaux")}
            >
              Choisir le vaisseau
            </button>
            <div className="navigation-div-selected">
              <label>Vaisseau à envoyer :</label>
              <p>{selectedShip}</p>
            </div>
          </section>

          <section className="navigation-div-select vaisseaux-div">
            <button
              className="button button-nav"
              onClick={() => navigate("/waypoints")}
            >
              Choisir le waypoint
            </button>
            <div className="navigation-div-selected">
              <label>Waypoint :</label>
              <p>{selectedWaypoint}</p>
            </div>
          </section>
        </div>

        <button className={"button button-nav"} onClick={handleWaypointChange}>
          Afficher les infos
        </button>
        <div className="navigation-div-infos">
          {distance !== null && (
            <div className="distance-info">
              <p>
                Carburant minimum à utiliser : {Math.round(distance)} unités
              </p>
            </div>
          )}
          {/* Affichez le message si le vaisseau est déjà sur le waypoint */}
          {alreadyOnWaypointMessage && (
            <div className="already-on-waypoint-info">
              <p style={{ color: "red" }}>{alreadyOnWaypointMessage}</p>
            </div>
          )}
          {tripDuration !== null && (
            <div className="duration-info">
              <p>Durée du trajet : {tripDuration} secondes</p>
            </div>
          )}
        </div>

        <button
          className={`button button-nav ${distance <= 0 ? "disabled" : ""}`}
          disabled={distance <= 0}
          onClick={handleNavigateButtonClick}
        >
          Envoyer
        </button>
        {showValidate && <Validate />}
        {/* Un élément vide non nécessaire a été supprimé ici */}
      </div>
    </div>
  );
};

export default Navigate;
