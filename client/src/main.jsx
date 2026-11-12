
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import App from "./App.jsx";
import GetAllDAta from "./GetAllDAta.jsx";
import "./index.css";

const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/getAllData", element: <GetAllDAta /> }
  ],
  {
    basename: window.location.hostname.endsWith("github.io")
      ? "/online_survey"
      : "/"
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
