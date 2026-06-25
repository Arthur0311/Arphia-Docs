
import { createRoot } from "react-dom/client";
import App from "./apps/damatools/App.tsx";
import { AuthProvider } from "./shared/contexts/AuthContext.tsx";
import "./shared/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
  