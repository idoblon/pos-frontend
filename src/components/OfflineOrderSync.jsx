import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/util/api";
import { pendingOfflineOrders, syncOfflineOrders } from "@/util/offlineOrderQueue";

export default function OfflineOrderSync() {
  const [pending, setPending] = useState(() => pendingOfflineOrders().length);
  const [syncing, setSyncing] = useState(false);

  const sync = async () => {
    if (!navigator.onLine || syncing || pendingOfflineOrders().length === 0) return;
    setSyncing(true);
    const result = await syncOfflineOrders((order, idempotencyKey) =>
      api.post("/api/orders", order, { headers: { "Idempotency-Key": idempotencyKey } }),
    );
    setPending(result.remaining);
    setSyncing(false);
    if (result.synced) toast.success(`${result.synced} offline sale${result.synced === 1 ? "" : "s"} synced.`);
  };

  useEffect(() => {
    const onOnline = () => sync();
    const refresh = () => setPending(pendingOfflineOrders().length);
    window.addEventListener("online", onOnline);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", refresh);
    };
  });

  if (navigator.onLine && pending === 0) return null;
  return (
    <button type="button" onClick={sync} disabled={syncing || !navigator.onLine}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white shadow-lg disabled:opacity-70">
      {syncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudOff size={14} />}
      {!navigator.onLine ? "Offline mode" : `${pending} sale${pending === 1 ? "" : "s"} waiting to sync`}
    </button>
  );
}
