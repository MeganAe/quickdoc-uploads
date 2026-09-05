import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashHistory } from "@tanstack/react-router";
import { getRouter } from "./router";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import "./styles.css";

if (Capacitor.isNativePlatform()) {
  void StatusBar.setBackgroundColor({ color: "#3b5998" });
  void StatusBar.setStyle({ style: Style.Light });
}

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
