import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "./../styles/scan.css";
import Menu from "./Menu";
import Loader from "./loader";

const ScanDashboard = ({}) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchWaypoints = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        // Récupérer la chaîne JSON du localStorage
        const waypointsString = localStorage.getItem("allWaypoints");

        // Convertir la chaîne JSON en tableau d'objets
        const parsedWaypoints = JSON.parse(waypointsString);
        console.log(parsedWaypoints);

        // Assurez-vous que parsedWaypoints est un tableau avant de le définir
        if (Array.isArray(parsedWaypoints)) {
          setWaypoints(parsedWaypoints);
        } else {
          // Si ce n'est pas un tableau valide, définissez waypoints comme un tableau vide
          setWaypoints([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1000);
      }
    };

    fetchWaypoints();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="waypoints">
      {waypoints.length > 0 ? (
        <div className="wrapper">
          <div className="board">
            <div className="waypoints-zone">
              {Array.isArray(waypoints) ? (
                waypoints.map((waypoint, index) => (
                  <div
                    key={index}
                    className="waypoint"
                    style={{
                      left: `${waypoint?.x ?? 0}%`,
                      top: `${waypoint?.y ?? 0}%`,
                    }}
                  ></div>
                ))
              ) : (
                <p>Aucun waypoint disponible pour ce système.</p>
              )}
            </div>

            <div className="round round-sm"></div>
            <div className="round round-md"></div>
            <div className="round round-lg"></div>
            <div className="line line-x"></div>
            <div className="line line-y"></div>
          </div>
          <div className="radar"></div>
        </div>
      ) : (
        <p>Aucun waypoint disponible pour ce système.</p>
      )}
    </div>
  );
};

export default ScanDashboard;
