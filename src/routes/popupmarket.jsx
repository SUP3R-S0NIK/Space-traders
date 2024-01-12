import React, { useState, useEffect } from "react";
import "./../styles/popup.css";
import Loader from "./loader";
import Validate from "./validate";

// ... (import statements)

const MarketplacePage = ({ systemSymbol, waypointSymbol, onClose }) => {
  const [marketData, setMarketData] = useState(null);
  const [token, setToken] = useState("");
  const [shipSymbol, setShipSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [cargoItems, setCargoItems] = useState([]);
  const [showBuy, setShowBuy] = useState(true); // Ajout de l'état pour montrer la section d'achat
  const [showSell, setShowSell] = useState(false);
  const [showValidate, setShowValidate] = useState(false);
  const [selectedTab, setSelectedTab] = useState("buy");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const shipSymbolStored = localStorage.getItem("selectedShipSymbol");
    setShipSymbol(shipSymbolStored || "");
    setToken(storedToken || "");
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://api.spacetraders.io/v2/systems/${systemSymbol}/waypoints/${waypointSymbol}/market`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Erreur lors de la requête pour obtenir les détails du marché."
        );
        return;
      }

      const data = await response.json();
      setMarketData(data.data);

      // Mettre à jour les articles du cargo après avoir obtenu de nouvelles données du marché
      if (data.data.myShip && data.data.myShip.cargo) {
        setCargoItems(
          data.data.myShip.cargo.map((cargoItem) => cargoItem.symbol)
        );
      }
    } catch (error) {
      console.error("Erreur lors de la requête de marché :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [token, systemSymbol, waypointSymbol]);

  useEffect(() => {
    if (marketData) {
      //   console.log("Données du marché :", marketData);
    }
  }, [marketData]);

  const handlePurchase = async (symbol) => {
    // console.log(`Achat de ${purchaseQuantity} unité(s) de ${symbol}`);
    try {
      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipSymbol}/purchase`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol: symbol,
            units: parseInt(purchaseQuantity),
          }),
        }
      );

      if (!response.ok) {
        console.error("Erreur lors de la demande d'achat.");
        return;
      }

      const result = await response.json();
      //   console.log("Résultat de la demande d'achat :", result);
      setShowValidate(true);

      // Masquer l'élément Validate après 1 seconde
      setTimeout(() => {
        setShowValidate(false);
      }, 1000);

      // Après l'achat, actualisez les données du marché pour refléter les changements
      fetchMarketData();
    } catch (error) {
      console.error("Erreur lors de la demande d'achat :", error);
    }
  };

  const handleSell = async (symbol) => {
    // console.log(`Vente de ${symbol} depuis le cargo`);
    try {
      const response = await fetch(
        `https://api.spacetraders.io/v2/my/ships/${shipSymbol}/sell`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol: symbol,
            units: parseInt(purchaseQuantity),
          }),
        }
      );

      if (!response.ok) {
        console.error("Erreur lors de la demande de vente.");
        return;
      }

      const result = await response.json();
      //   console.log("Résultat de la demande de vente :", result);
      setShowValidate(true);

      // Masquer l'élément Validate après 1 seconde
      setTimeout(() => {
        setShowValidate(false);
      }, 1000);

      // Après la vente, actualisez les données du marché pour refléter les changements
      fetchMarketData();
    } catch (error) {
      console.error("Erreur lors de la demande de vente :", error);
    }
  };

  // Fonction pour vérifier si l'article est dans le cargo du vaisseau
  const isItemInCargo = (symbol) => {
    return cargoItems.includes(symbol);
  };

  const handleBuyButtonClick = () => {
    setSelectedTab("buy");
    setShowBuy(true);
    setShowSell(false);
  };

  const handleSellButtonClick = () => {
    setSelectedTab("sell");
    setShowBuy(false);
    setShowSell(true);
  };

  return (
    <div className="popup-div">
      <button onClick={onClose} className="button">
        Fermer
      </button>
      <h2>Marketplace Page</h2>
      {/* Boutons pour basculer entre les sections d'achat et de vente */}
      <div>
        <button
          onClick={handleBuyButtonClick}
          className={`button ${selectedTab === "buy" ? "disabled" : ""}`} // Ajout de la classe "disabled" si l'onglet "Acheter" est sélectionné
          disabled={selectedTab === "buy"} // Désactiver le bouton si l'onglet "Acheter" est sélectionné
        >
          Acheter
        </button>
        <button
          onClick={handleSellButtonClick}
          className={`button ${selectedTab === "sell" ? "disabled" : ""}`} // Ajout de la classe "disabled" si l'onglet "Vendre" est sélectionné
          disabled={selectedTab === "sell"} // Désactiver le bouton si l'onglet "Vendre" est sélectionné
        >
          Vendre
        </button>
      </div>
      {loading ? (
        "Chargement..."
      ) : (
        <>
          {/* Section d'achat */}
          {showBuy && (
            <div className="imports-div">
              <h3>Imports</h3>
              <table className="table-market">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Restant</th>
                    <th>Prix d'achat</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>

                {marketData && marketData.tradeGoods ? (
                  <tbody>
                    {marketData.tradeGoods.map((item) => (
                      <tr key={item.symbol}>
                        <td>{item.symbol}</td>
                        <td>{item.tradeVolume}</td>
                        <td>{item.purchasePrice}</td>

                        <td>
                          <input
                            type="number"
                            className="select"
                            min="1"
                            value={purchaseQuantity}
                            onChange={(e) =>
                              setPurchaseQuantity(e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="button"
                            onClick={() => handlePurchase(item.symbol)}
                          >
                            Acheter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : null}
              </table>
            </div>
          )}

          {/* Section de vente */}
          {showSell && (
            <div className="exports-div">
              <h3>Exports</h3>
              <table className="table-market">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Prix de vente</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>

                {marketData && marketData.tradeGoods ? (
                  <tbody>
                    {marketData.tradeGoods.map((item) => (
                      <tr key={item.symbol}>
                        <td>{item.symbol}</td>
                        <td>{item.purchasePrice}</td>

                        <td>
                          <input
                            type="number"
                            className="select"
                            min="1"
                            value={purchaseQuantity}
                            onChange={(e) =>
                              setPurchaseQuantity(e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="button"
                            onClick={() => handleSell(item.symbol)}
                            disabled={isItemInCargo(item.symbol)}
                          >
                            Vendre
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : null}
              </table>
            </div>
          )}
        </>
      )}
      {showValidate && <Validate />}{" "}
    </div>
  );
};

export default MarketplacePage;
