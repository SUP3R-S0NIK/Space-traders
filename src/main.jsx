import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import "./index.css";
import Connexion from "./routes/Connexion";
import Home from "./routes/HomePage";
import Vaisseaux from "./routes/Vaisseau";
import AchatVaisseaux from "./routes/AchatVaisseau";
import Menu from "./routes/Menu";

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
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
