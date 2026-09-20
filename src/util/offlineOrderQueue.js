import secureStorage from "@/util/secureStorage";

const QUEUE_PREFIX = "pos_offline_order_queue";
const MAX_QUEUED_ORDERS = 200;

const queueKey = () => {
  const user = secureStorage.getUserData?.() || {};
  const identity = [user.storeId, user.branchId, user.id || user.userId].filter(Boolean).join(":");
  return `${QUEUE_PREFIX}:${identity || "anonymous"}`;
};

const notify = () => window.dispatchEvent(new Event("offline-order-queue-change"));

const readQueue = () => {
  try {
    const value = JSON.parse(localStorage.getItem(queueKey()) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue) => {
  localStorage.setItem(queueKey(), JSON.stringify(queue));
  notify();
};

export const pendingOfflineOrders = () => readQueue();

export const queueOfflineOrder = ({ order, idempotencyKey }) => {
  const queuedOrder = {
    id: `offline-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    order,
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };
  const queue = readQueue();
  if (queue.length >= MAX_QUEUED_ORDERS) {
    throw new Error("Offline queue is full. Reconnect and sync pending sales before continuing.");
  }
  queue.push(queuedOrder);
  writeQueue(queue);
  return queuedOrder;
};

// The same idempotency key is retained so a retry cannot create a duplicate sale.
export const syncOfflineOrders = async (submit) => {
  const queue = readQueue();
  const syncedIds = new Set();
  let synced = 0;

  for (const queuedOrder of queue) {
    try {
      await submit(queuedOrder.order, queuedOrder.idempotencyKey);
      synced += 1;
      syncedIds.add(queuedOrder.id);
    } catch {
      // Keep the order for the next online attempt. Server idempotency makes an
      // ambiguous network failure safe to retry.
    }
  }
  // Re-read before saving so an order queued in another tab is not overwritten.
  const remaining = readQueue().filter((queuedOrder) => !syncedIds.has(queuedOrder.id));
  writeQueue(remaining);
  return { synced, remaining: remaining.length };
};
