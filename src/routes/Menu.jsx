import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./../styles/menu.css";

const Menu = () => {
  const location = useLocation();
  const [token, setToken] = useState("");
  const [symbolDuJoueur, setSymbolDuJoueur] = useState("");
  const [accountId, setAccountId] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [credits, setCredits] = useState("");
  const [startingFaction, setStartingFaction] = useState("");
  const [shipCount, setShipCount] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Nouvel état pour suivre si le menu est ouvert
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedSymbolDuJoueur = localStorage.getItem("symbolDuJoueur");

        setToken(storedToken);
        setSymbolDuJoueur(storedSymbolDuJoueur);

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
          const agentData = data.data; // La structure de la réponse a un champ "data"

          setAccountId(agentData.accountId);
          setAccountId(agentData.accountId);
          setHeadquarters(agentData.headquarters);
          setCredits(agentData.credits);
          setStartingFaction(agentData.startingFaction);
          setShipCount(agentData.shipCount);
        } else {
          console.error(
            "Erreur lors de la récupération des données. Veuillez réessayer."
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const logOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="menu">
      <ul>
        <MenuItem to="/home">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-speedometer2"
            viewBox="0 0 16 16"
          >
            <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z" />
            <path
              fillRule="evenodd"
              d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3"
            />
          </svg>
          Tableau de bord
        </MenuItem>
        <MenuItem to="/vaisseaux">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-rocket-fill"
            viewBox="0 0 16 16"
          >
            <path d="M10.175 1.991c.81 1.312 1.583 3.43 1.778 6.819l1.5 1.83A2.5 2.5 0 0 1 14 12.202V15.5a.5.5 0 0 1-.9.3l-1.125-1.5c-.166-.222-.42-.4-.752-.57-.214-.108-.414-.192-.627-.282l-.196-.083C9.7 13.793 8.85 14 8 14c-.85 0-1.7-.207-2.4-.635-.068.03-.133.057-.198.084-.211.089-.411.173-.625.281-.332.17-.586.348-.752.57L2.9 15.8a.5.5 0 0 1-.9-.3v-3.298a2.5 2.5 0 0 1 .548-1.562l.004-.005L4.049 8.81c.197-3.323.969-5.434 1.774-6.756.466-.767.94-1.262 1.31-1.57a3.67 3.67 0 0 1 .601-.41A.549.549 0 0 1 8 0c.101 0 .17.027.25.064.037.017.086.041.145.075.118.066.277.167.463.315.373.297.85.779 1.317 1.537ZM9.5 6c0-1.105-.672-2-1.5-2s-1.5.895-1.5 2S7.172 8 8 8s1.5-.895 1.5-2" />
            <path d="M8 14.5c.5 0 .999-.046 1.479-.139L8.4 15.8a.5.5 0 0 1-.8 0l-1.079-1.439c.48.093.98.139 1.479.139" />
          </svg>
          Mes vaisseaux
        </MenuItem>
        <MenuItem to="/buy_vaisseaux">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-cash"
            viewBox="0 0 16 16"
          >
            <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
            <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z" />
          </svg>
          Achat de Vaisseaux
        </MenuItem>
        <MenuItem to="/waypoints">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-cash"
            viewBox="0 0 16 16"
          >
            <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
            <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z" />
          </svg>
          Waypoints
        </MenuItem>
        <MenuItem to="/navigate">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-cash"
            viewBox="0 0 16 16"
          >
            <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
            <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z" />
          </svg>
          Naviguer
        </MenuItem>
      </ul>
      <div className="div-account">
        <section>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-person-circle"
            viewBox="0 0 16 16"
          >
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path
              fillRule="evenodd"
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
            />
          </svg>
        </section>
        <div className={`info-agent ${isMenuOpen ? "open" : ""}`}>
          <p>{symbolDuJoueur}</p>
          <p>{startingFaction}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className={`bi bi-chevron-down ${isMenuOpen ? "open" : ""}`}
          viewBox="0 0 16 16"
          onClick={toggleMenu}
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-box-arrow-right"
          viewBox="0 0 16 16"
          onClick={logOut}
        >
          <path
            fillRule="evenodd"
            d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
          />
          <path
            fillRule="evenodd"
            d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
        {isMenuOpen && (
          <div className="additional-menu">
            <p>HQ : {headquarters}</p>
            <p>{credits} Credits</p>
            <p>{shipCount} ships</p>
          </div>
        )}
      </div>
    </nav>
  );
};

const MenuItem = ({ to, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (location.pathname !== to) {
      navigate(to);
    }
  };

  return (
    <li
      className={`${location.pathname === to ? "active" : ""}`}
      onClick={handleNavigation}
    >
      <Link to={to}>{children}</Link>
    </li>
  );
};

export default Menu;
