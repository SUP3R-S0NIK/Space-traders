import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Connexion from "./routes/Connexion";
import Home from "./routes/HomePage";

// import AchatVaisseau from "./routes/AchatVaisseau";
// import Minage from "./routes/Minage";
// import Vente from "./routes/Vente";
// import ErrorPage from "./error-page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Connexion />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
