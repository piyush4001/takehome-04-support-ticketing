import type { ReactNode } from "react";
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
import CreateTicket from "./pages/CreateTicket";
import SlaAlerts from "./pages/SlaAlerts";
import Profile from "./pages/Profile";
import {
  AuthProvider,
} from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" replace />;
}

function SupervisorRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return user?.role === "SUPERVISOR" ? (
    children
  ) : (
    <Navigate to="/tickets" replace />
  );
}

function AppRoutes() {
  const { token, user, login } = useAuth();
  const defaultPath = user?.role === "SUPERVISOR" ? "/dashboard" : "/tickets";

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to={defaultPath} replace />
          ) : (
            <Login onLogin={login} />
          )
        }
      />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route
          path="/dashboard"
          element={
            <SupervisorRoute>
              <Dashboard />
            </SupervisorRoute>
          }
        />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/alerts" element={<SlaAlerts />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={token ? defaultPath : "/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
