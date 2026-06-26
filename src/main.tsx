
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./shared/contexts/AuthContext.tsx";
import DamaToolsApp from "./apps/damatools/App.tsx";
import LandingPage from "./apps/home/LandingPage.tsx";
import "./shared/styles/index.css";

const router = createBrowserRouter([
  { path: "/",          element: <LandingPage /> },
  { path: "/damatools", element: <DamaToolsApp /> },
], { basename: '/Arphia-Docs' });

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
