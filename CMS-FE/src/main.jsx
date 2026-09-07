import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App";
import "./index.css";
import UserProvider from "./context/UserContext";
import AlertProvider from "./context/AlertContext";
import AdminAuthProvider from "./context/AdminAuthContext";
import Hooks from "./hooks/Hooks";

const jhamtaniTheme = createTheme({
  palette: {
    primary: {
      main: "#C5A880",
      dark: "#A0725B",
      light: "#C1AF86",
      contrastText: "#191f26",
    },
    secondary: {
      main: "#191f26",
      contrastText: "#f5f3ef",
    },
    background: {
      default: "#f5f3ef",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Outfit", system-ui, sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: "0.14em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 700,
          fontSize: "0.7rem",
          padding: "10px 22px",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          backgroundColor: "#C5A880",
          color: "#191f26",
          border: "1px solid #C5A880",
          "&:hover": {
            backgroundColor: "#A0725B",
            color: "#ffffff",
            borderColor: "#A0725B",
          },
        },
        containedPrimary: {
          backgroundColor: "#C5A880",
          color: "#191f26",
          "&:hover": {
            backgroundColor: "#A0725B",
            color: "#ffffff",
          },
        },
        containedSuccess: {
          backgroundColor: "#C5A880",
          color: "#191f26",
          "&:hover": {
            backgroundColor: "#A0725B",
            color: "#ffffff",
          },
        },
        containedError: {
          backgroundColor: "#C5A880",
          color: "#191f26",
          "&:hover": {
            backgroundColor: "#A0725B",
            color: "#ffffff",
          },
        },
        outlined: {
          borderColor: "#C5A880",
          color: "#A0725B",
          "&:hover": {
            backgroundColor: "#C5A880",
            color: "#171a1f",
            borderColor: "#C5A880",
          },
        },
        outlinedPrimary: {
          borderColor: "#C5A880",
          color: "#A0725B",
          "&:hover": {
            backgroundColor: "#C5A880",
            color: "#171a1f",
            borderColor: "#C5A880",
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={jhamtaniTheme}>
      <AlertProvider>
        <UserProvider>
          <AdminAuthProvider>
            <App />
            <Hooks />
          </AdminAuthProvider>
        </UserProvider>
      </AlertProvider>
    </ThemeProvider>
  </React.StrictMode>
);
