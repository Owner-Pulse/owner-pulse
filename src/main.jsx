import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { RouterProvider } from "react-router";
import { router } from "./router/router.jsx";
import { Providers } from "./providers";

registerSW({
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>,
);
