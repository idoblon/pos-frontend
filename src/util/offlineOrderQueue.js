const QUEUE_KEY = "pos_offline_order_queue";

const readQueue = () => {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue) => localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

export const pendingOfflineOrders = () => readQueue();

export const queueOfflineOrder = ({ order, idempotencyKey }) => {
  const queuedOrder = {
    id: `offline-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    order,
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };
  const queue = readQueue();
  queue.push(queuedOrder);
  writeQueue(queue);
  return queuedOrder;
};

// The same idempotency key is retained so a retry cannot create a duplicate sale.
export const syncOfflineOrders = async (submit) => {
  const queue = readQueue();
  const remaining = [];
  let synced = 0;

  for (const queuedOrder of queue) {
    try {
      await submit(queuedOrder.order, queuedOrder.idempotencyKey);
      synced += 1;
    } catch {
      remaining.push(queuedOrder);
    }
  }
  writeQueue(remaining);
  return { synced, remaining: remaining.length };
};
