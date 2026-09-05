import { useCallback, useEffect, useRef, useState } from "react";

import api from "../lib/api";
import type { SLAAlert, SLAAlertsResponse } from "../types/sla";

const SLA_ALERTS_CHANGED_EVENT = "sla-alerts-changed";

let alertsCache: SLAAlert[] | null = null;

export function useSlaAlerts() {
  const [alerts, setAlerts] = useState<SLAAlert[]>(
    () => alertsCache ?? []
  );

  const [loading, setLoading] = useState(
    () => alertsCache === null
  );

  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const refetch = useCallback(async (force = true) => {
    // Use cached data when explicitly requested without forcing
    // a server refresh.
    if (!force && alertsCache !== null) {
      setAlerts(alertsCache);
      setLoading(false);
      setError("");
      return;
    }

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const response = await api.get<SLAAlertsResponse>(
        "/sla/alerts"
      );

      const nextAlerts = response.data.data;

      alertsCache = nextAlerts;

      if (requestId !== requestIdRef.current) {
        return;
      }

      setAlerts(nextAlerts);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError("Unable to load SLA alerts.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (alertsCache !== null) {
      setAlerts(alertsCache);
      setLoading(false);
      setError("");
    } else {
      // This effect intentionally starts the initial request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refetch(true);
    }

    const handleAlertsChanged = () => {
      void refetch(true);
    };

    window.addEventListener(
      SLA_ALERTS_CHANGED_EVENT,
      handleAlertsChanged
    );

    return () => {
      window.removeEventListener(
        SLA_ALERTS_CHANGED_EVENT,
        handleAlertsChanged
      );
    };
  }, [refetch]);

  async function acknowledge(alertId: string) {
    await api.post(`/sla/alerts/${alertId}/acknowledge`);

    const nextAlerts =
      alertsCache?.filter(
        (alert) => alert.id !== alertId
      ) ?? [];

    alertsCache = nextAlerts;
    setAlerts(nextAlerts);

    window.dispatchEvent(
      new Event(SLA_ALERTS_CHANGED_EVENT)
    );
  }

  return {
    alerts,
    loading,
    error,
    refetch: () => refetch(true),
    acknowledge,
  };
}