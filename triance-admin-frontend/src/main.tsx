import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";

import { createTheme, Loader, MantineProvider } from "@mantine/core";
import {
  AuthProvider,
  LoaderProvider,
  LoggerProvider,
  ToastProvider,
} from "./contexts";

// Optional: customize Mantine theme
const theme = createTheme({
  components: {
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders },
        type: "ring",
      },
    }),
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <LoaderProvider>
        <LoggerProvider>
          <ToastProvider>
            <AuthProvider>
              <Router>
                <App />
              </Router>
            </AuthProvider>
          </ToastProvider>
        </LoggerProvider>
      </LoaderProvider>
    </MantineProvider>
  </StrictMode>
);
