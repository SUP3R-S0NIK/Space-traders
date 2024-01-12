import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Connexion from "./routes/Connexion";
import Home from "./routes/HomePage";
import Vaisseaux from "./routes/Vaisseau";
import AchatVaisseaux from "./routes/AchatVaisseau";
import Scan from "./routes/scan-waypoints";

import Minage from "./routes/Minage";
import Navigation from "./routes/navigation.jsx";
import InfoNav from "./routes/infos-navigation.jsx";
import Vaisseau from "./routes/ship";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Connexion />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/vaisseaux",
    element: <Vaisseaux />,
  },
  {
    path: "/buy_vaisseaux",
    element: <AchatVaisseaux />,
  },
  {
    path: "/waypoints",
    element: <Scan />,
  },
  {
    path: "/navigate",
    element: <Navigation />,
  },
  {
    path: "/info-nav",
    element: <InfoNav />,
  },
  {
    path: "/miner",
    element: <Minage />,
  },
  {
    path: "/vaisseau",
    element: <Vaisseau />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
