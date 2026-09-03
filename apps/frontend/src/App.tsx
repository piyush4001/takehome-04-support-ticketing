import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import Layout from "./components/Layout";
export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  function handleLogin(newToken: string) {
    setToken(newToken);
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
  <Route element={<Layout />}>
    <Route
      path="/dashboard"
      element={<Dashboard />}
    />

    <Route
      path="/tickets"
      element={<Tickets />}
    />

    <Route
      path="/tickets/:id"
      element={<TicketDetails />}
    />
  </Route>

  <Route
    path="/login"
    element={<Navigate to="/dashboard" replace />}
  />

  <Route
    path="*"
    element={<Navigate to="/dashboard" replace />}
  />
</Routes>
    </BrowserRouter>
  );
}