import { useCallback, useEffect, useState } from "react";

import api from "../lib/api";
import type { SLAAlert, SLAAlertsResponse } from "../types/sla";

const SLA_ALERTS_CHANGED_EVENT = "sla-alerts-changed";

export function useSlaAlerts() {
  const [alerts, setAlerts] = useState<SLAAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<SLAAlertsResponse>("/sla/alerts");
      setAlerts(response.data.data);
    } catch {
      setError("Unable to load SLA alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFetchId = window.setTimeout(() => {
      void refetch();
    }, 0);
    window.addEventListener(SLA_ALERTS_CHANGED_EVENT, refetch);

    return () => {
      window.clearTimeout(initialFetchId);
      window.removeEventListener(SLA_ALERTS_CHANGED_EVENT, refetch);
    };
  }, [refetch]);

  async function acknowledge(alertId: string) {
    await api.post(`/sla/alerts/${alertId}/acknowledge`);
    setAlerts((current) => current.filter((alert) => alert.id !== alertId));
    window.dispatchEvent(new Event(SLA_ALERTS_CHANGED_EVENT));
  }

  return {
    alerts,
    loading,
    error,
    refetch,
    acknowledge,
  };
}
