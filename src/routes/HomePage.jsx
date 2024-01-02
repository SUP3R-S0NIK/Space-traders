import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/dashboard.css";
import Menu from "./Menu";
import Loader from "./loader"; // Assurez-vous de mettre le chemin correct vers votre fichier Loader

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [symbolDuJoueur, setSymbolDuJoueur] = useState("");
  const [accountId, setAccountId] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [credits, setCredits] = useState("");
  const [startingFaction, setStartingFaction] = useState("");
  const [shipCount, setShipCount] = useState("");
  const [ships, setShips] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [moneyHistory, setMoneyHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedSymbolDuJoueur = localStorage.getItem("symbolDuJoueur");

        setToken(storedToken);
        setSymbolDuJoueur(storedSymbolDuJoueur);

        // Vous pouvez également effectuer une nouvelle requête à l'API pour obtenir les informations mises à jour si nécessaire
        // Assurez-vous de gérer correctement les erreurs et les cas où le token n'est pas valide

        const response = await fetch(
          "https://api.spacetraders.io/v2/my/agent",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Mettez à jour l'état avec les données reçues
          setAccountId(data.accountId);
          setHeadquarters(data.headquarters);
          setCredits(data.credits);
          setStartingFaction(data.startingFaction);
          setShipCount(data.shipCount);
        } else {
          console.error(
            "Erreur lors de la récupération des données. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        // Même en cas d'erreur, arrêtez le chargement
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Durée de 10 secondes
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // useEffect(() => {
  //   const fetchMoneyHistory = async () => {
  //     try {
  //       const storedMoneyHistory = localStorage.getItem("moneyHistory");

  //       if (storedMoneyHistory) {
  //         setMoneyHistory(JSON.parse(storedMoneyHistory));
  //       } else {
  //         console.warn(
  //           "Aucune donnée d'historique de gains trouvée dans le stockage local."
  //         );
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Erreur lors de la récupération de l'historique de gains depuis le stockage local :",
  //         error
  //       );
  //     }
  //   };

  //   fetchMoneyHistory();
  // }, []);

  // const calculateDailyGains = (currentCredits, currentDate, moneyHistory) => {
  //   moneyHistory = moneyHistory || [];

  //   if (moneyHistory.length === 0) {
  //     return [
  //       {
  //         date: currentDate,
  //         gains: currentCredits,
  //       },
  //     ];
  //   }

  //   const lastRecord = moneyHistory[moneyHistory.length - 1];
  //   const gains = currentCredits - lastRecord.gains;

  //   if (currentDate !== lastRecord.date) {
  //     const dailyGains = {
  //       date: currentDate,
  //       gains: gains,
  //     };
  //     const updatedMoneyHistory = [...moneyHistory, dailyGains];
  //     return updatedMoneyHistory;
  //   }

  //   const updatedLastRecord = {
  //     ...lastRecord,
  //     gains: gains,
  //   };

  //   const updatedMoneyHistory = [
  //     ...moneyHistory.slice(0, moneyHistory.length - 1),
  //     updatedLastRecord,
  //   ];

  //   return updatedMoneyHistory;
  // };

  // useEffect(() => {
  //   // Effectuez des actions à chaque changement de crédits ou d'historique de gains
  //   const updateMoneyHistory = () => {
  //     const currentDate = new Date().toLocaleDateString();
  //     const dailyGains = calculateDailyGains(
  //       credits,
  //       currentDate,
  //       moneyHistory
  //     );

  //     setMoneyHistory(dailyGains);

  //     // Stocker les données d'historique de gains dans le stockage local
  //     localStorage.setItem("moneyHistory", JSON.stringify(dailyGains));
  //   };

  //   updateMoneyHistory();
  // }, [credits, moneyHistory]);

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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <Menu />

      <div className="main">
        <h2 id="title">Tableau de bord</h2>
        <div className="dashboard">
          <div className="Ship">
            <h4>Mes vaisseaux :</h4>
            <table>
              <thead>
                <tr>
                  <th>Nom du vaisseau</th>
                  <th>Type de vaisseau</th>
                  <th>Statut du vaisseau</th>
                  <th>Capacité du vaisseau</th>
                  <th>Essence du vaisseau</th>
                </tr>
              </thead>
              <tbody>
                {ships.map((ship) => (
                  <tr key={ship.symbol}>
                    <td>{ship.registration.name}</td>
                    <td>{ship.frame.name}</td>
                    <td>{ship.nav.status}</td>
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
                        ></progress>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="button" onClick={() => navigate("/vaisseaux")}>
              Gérer
            </button>
          </div>

          <div className="Money">
            <h4>Mon argent :</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Gains (Crédits)</th>
                </tr>
              </thead>
              <tbody>
                {moneyHistory.map((entry) => (
                  <tr key={entry.date}>
                    <td>{entry.date}</td>
                    <td>{entry.gains}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="Map"></div>

          <div className="Contrats">
            <h4>Mes contrats :</h4>
            {/* Ajoutez ici la section des contrats */}
          </div>
        </div>
      </div>
    </div>
  );
}
