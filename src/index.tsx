import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./styles/tailwind.css";

const children = (
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>
);

const container = document.getElementById("root");
createRoot(container as Element).render(children); // For React 18
