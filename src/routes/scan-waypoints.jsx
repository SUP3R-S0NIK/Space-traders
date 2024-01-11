import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "./../styles/scan.css";
import Menu from "./Menu";
import Loader from "./loader";
import PopupWaypoint from "./popup-waypoint";

export default function Waypoints() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [selectedWaypointSymbol, setSelectedWaypointSymbol] = useState(null);
  const [selectedSystemSymbol, setSelectedSystemSymbol] = useState(null);
  const [selectedWaypointType, setSelectedWaypointType] = useState(""); // Vous pouvez initialiser selon vos besoins
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

  useEffect(() => {
    let isMounted = true;
    let endpoint = "";
    let allWaypoints = [];
    const fetchWaypoints = async (waypointType, page = 1) => {
      try {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        const systemSymbol = localStorage.getItem("systemSymbol");

        console.log(waypointType);
        // Si "Tous" est sélectionné, utilisez les données du localStorage
        if (waypointType === "Tous") {
          const waypointsString = localStorage.getItem("allWaypoints");

          const parsedWaypoints = JSON.parse(waypointsString);
          console.log(parsedWaypoints);

          if (Array.isArray(parsedWaypoints)) {
            allWaypoints = parsedWaypoints;
          }
        } else {
          // Sinon, construisez l'URL en fonction du type de waypoint sélectionné
          let waypointsUrl = "";
          if (waypointType === "SHIPYARD") {
            waypointsUrl = `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=SHIPYARD`;
          } else if (waypointType === "MARKETPLACE") {
            waypointsUrl = `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=MARKETPLACE&page=${page}`;
          }

          const waypointsResponse = await fetch(waypointsUrl, {
            headers: {
              Accept: "application/json",
            },
          });

          if (!waypointsResponse.ok) {
            console.error(
              "Erreur lors de la récupération des waypoints du système. Veuillez réessayer."
            );
            return;
          }

          const data = await waypointsResponse.json();
          allWaypoints = allWaypoints.concat(data.data);

          const itemsPerPage = data.meta?.limit || 10;
          if (data.data.length === itemsPerPage) {
            const nextPageData = await fetchWaypoints(waypointType, page + 1);
            allWaypoints = allWaypoints.concat(nextPageData);
          }
        }

        console.log(allWaypoints);
        setWaypoints(allWaypoints);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1000);
      }
    };

    fetchWaypoints(selectedWaypointType);
    return () => {
      isMounted = false;
    };
  }, [selectedWaypointType]);

  // const fetchWaypoints = async (waypointType, page = 1) => {
  //   try {
  //     const storedToken = localStorage.getItem("token");
  //     setToken(storedToken);

  //     const agentResponse = await fetch(
  //       "https://api.spacetraders.io/v2/my/agent",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${storedToken}`,
  //         },
  //       }
  //     );

  //     if (!agentResponse.ok) {
  //       console.error(
  //         "Erreur lors de la récupération des informations de l'agent. Veuillez réessayer."
  //       );
  //       return;
  //     }

  //     const agentData = await agentResponse.json();
  //     const headquartersSymbol = agentData.data.headquarters;

  //     if (!headquartersSymbol) {
  //       console.error("Le symbole du siège social est indéfini.");
  //       return;
  //     }

  //     const systemSymbol = headquartersSymbol.substring(
  //       0,
  //       headquartersSymbol.lastIndexOf("-")
  //     );

  //     // Utilisez l'état selectedWaypointType pour construire l'URL de l'API
  //     const waypointsResponse = await fetch(
  //       `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints?traits=${selectedWaypointType}&page=${page}`,
  //       {
  //         headers: {
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     if (!waypointsResponse.ok) {
  //       console.error(
  //         "Erreur lors de la récupération des waypoints du système. Veuillez réessayer."
  //       );
  //       return;
  //     }
  //     const data = await waypointsResponse.json();
  //     allWaypoints = allWaypoints.concat(data.data);

  //     // Vérifiez si la longueur des données est inférieure à la limite par page
  //     const itemsPerPage = data.meta?.limit || 10; // Remplacez 10 par la limite réelle par page si différente
  //     if (data.data.length === itemsPerPage) {
  //       // Appel récursif pour récupérer les pages suivantes
  //       const nextPageData = await fetchWaypoints(waypointType, page + 1);
  //       console.log("next", nextPageData);
  //       allWaypoints = allWaypoints.concat(nextPageData);
  //     }

  //     console.log(allWaypoints);
  //     setWaypoints(allWaypoints);
  //     // localStorage.setItem("allWaypoints", JSON.stringify(allWaypoints));
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des données :", error);
  //   } finally {
  //     setTimeout(() => {
  //       if (isMounted) setLoading(false);
  //     }, 1000);
  //   }
  // };

  const handlePopupButtonClick = (waypoint) => {
    // Afficher la popup lors du clic sur "Envoyer un vaisseau"
    setSelectedWaypointSymbol(waypoint.symbol);
    setSelectedSystemSymbol(waypoint.systemSymbol);
    setPopupVisibility(true);
  };

  const handlePopupClose = () => {
    // Fermer la popup
    setPopupVisibility(false);
  };
  // console.log(waypoints);
  // if (loading) {
  //   return <Loader />;
  // }
  // console.log(waypoints[8].symbol);
  console.log(waypoints);
  console.log(selectedSystemSymbol);
  return (
    <div className="page page-scan">
      <Menu />
      <div className="main">
        <h2 id="title">Waypoints du système</h2>
        <div className="scan-filtre">
          <label>Sélectionner le type de waypoint :</label>
          <select
            value={selectedWaypointType}
            onChange={(event) => setSelectedWaypointType(event.target.value)}
            className="select"
          >
            <option value="Tous">Tous</option>
            <option value="SHIPYARD">Shipyard</option>
            <option value="MARKETPLACE">Marketplace</option>
          </select>
        </div>

        <div className="div-waypoints">
          <div className="waypoints">
            <div className="wrapper">
              <div className="board">
                <div className="waypoints-zone">
                  {Array.isArray(waypoints) ? (
                    waypoints.map((waypoint, index) => (
                      <div
                        onClick={() => handlePopupButtonClick(waypoint)}
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
          </div>
        </div>

        <div className="list-waypoints">
          <h4>Liste des waypoints</h4>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Caractéristique(s)</th>
              </tr>
            </thead>
            <tbody>
              {/* {Array.isArray(waypoints) && waypoints.length > 0 ? (
                waypoints.map((waypoint, index) => (
                  <tr key={index} id={`${waypoint.symbol}`}>
                    <td>{index}</td>
                    <td>{waypoint.type}</td>
                    <td>
                      {waypoint.traits && Array.isArray(waypoint.traits)
                        ? waypoint.traits.map((trait) => trait.name).join(", ")
                        : ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">
                    <p>Aucun waypoint disponible pour ce système.</p>
                  </td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>

        <div className={`blur-div ${isPopupVisible ? "visible" : "hidden"}`}>
          {isPopupVisible && (
            <PopupWaypoint
              selectedWaypoint={selectedWaypointSymbol}
              selectedSystem={selectedSystemSymbol}
              onClose={handlePopupClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
