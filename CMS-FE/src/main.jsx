import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import UserProvider from "./context/UserContext";
import AlertProvider from "./context/AlertContext";
import AdminAuthProvider from "./context/AdminAuthContext";
// import Alert from "./components/Alert";
import Hooks from "./hooks/Hooks";
// import Loader from "./components/Loader";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlertProvider>
      <UserProvider>
        <AdminAuthProvider>
          <App />
          {/* <Loader /> */}
          {/* <Alert /> */}
          <Hooks />
        </AdminAuthProvider>
      </UserProvider>
    </AlertProvider>
  </React.StrictMode>
);
