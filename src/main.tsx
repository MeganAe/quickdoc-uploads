import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashHistory } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// In Electron / Capacitor (file:// or capacitor://), hash history provides seamless routing without a web server
const isFileOrCapacitor =
  typeof window !== "undefined" &&
  (window.location.protocol === "file:" ||
    window.location.protocol === "capacitor:" ||
    (!window.location.origin.startsWith("http://") &&
      !window.location.origin.startsWith("https://")));

const history = isFileOrCapacitor ? createHashHistory() : undefined;
const router = getRouter(history);

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
