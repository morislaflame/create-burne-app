import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BurneProviders } from "./components/burne-providers";
import App from "./App";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BurneProviders>
      <App />
    </BurneProviders>
  </StrictMode>,
);
