import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import AppWrapper from "./AppWrapper.jsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
