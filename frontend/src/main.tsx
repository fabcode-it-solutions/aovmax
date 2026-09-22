import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// HTTPS enforcement
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

createRoot(document.getElementById("root")!).render(<App />);
