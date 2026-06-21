import api from "@/util/api";

const normalizePlan = (plan) => {
  if (!plan) return null;
  return String(plan).trim().toUpperCase();
};

const getStoreName = (store) =>
  store?.brand || store?.storeName || store?.name || "";

const getId = (item) => item?.id ?? item?._id;

const getRegistrationStoreId = (request) =>
  request.createdStoreId ||
  getId(request) ||
  request.email ||
  request.storeName;

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return [
    value.data,
    value.items,
    value.results,
    value.content,
    value.stores,
    value.requests,
  ].find(Array.isArray) || [];
};

const findMatchingRegistration = (store, registrations) => {
  const storeId = getId(store);
  const storeName = getStoreName(store).toLowerCase();

  const byStoreId = registrations.find(
    (req) =>
      req.createdStoreId != null &&
      storeId != null &&
      String(req.createdStoreId) === String(storeId),
  );
  if (byStoreId) return byStoreId;

  const byName = registrations.filter(
    (req) =>
      req.storeName &&
      storeName &&
      req.storeName.toLowerCase() === storeName,
  );

  return (
    byName.find((req) => req.status === "APPROVED") ||
    byName[0] ||
    null
  );
};

const mergeRegistrationDataWithStores = async (stores, headers) => {
  const storeList = getList(stores);

  try {
    const regRes = await api.get("/api/admin/registration-requests", { headers });
    const registrations = getList(regRes.data);

    const mergedStores = storeList.map((store) => {
      const matchingRequest = findMatchingRegistration(store, registrations);
      if (!matchingRequest) {
        return store;
      }

      return {
        ...store,
        subscriptionPlan:
          normalizePlan(store.subscriptionPlan) ||
          normalizePlan(matchingRequest.subscriptionPlan),
        estimatedBranches:
          store.estimatedBranches ?? matchingRequest.estimatedBranches ?? 1,
        estimatedUsers:
          store.estimatedUsers ?? matchingRequest.estimatedUsers ?? 1,
        fullName: store.fullName || matchingRequest.ownerName,
        ownerName: store.ownerName || matchingRequest.ownerName,
        storeAddress: store.storeAddress || matchingRequest.storeAddress,
        email: store.email || matchingRequest.email,
        phone: store.phone || matchingRequest.phone,
        subscriptionPurchaseDate:
          store.subscriptionPurchaseDate ||
          store.purchaseDate ||
          matchingRequest.subscriptionPurchaseDate ||
          matchingRequest.purchaseDate ||
          matchingRequest.paidAt ||
          matchingRequest.paymentDate ||
          matchingRequest.approvedAt ||
          matchingRequest.createdAt,
        subscriptionExpiry:
          store.subscriptionExpiry ||
          store.subscriptionExpiryDate ||
          store.expiryDate ||
          store.expiresAt ||
          matchingRequest.subscriptionExpiry ||
          matchingRequest.subscriptionExpiryDate ||
          matchingRequest.expiryDate ||
          matchingRequest.expiresAt,
        registrationRequestId:
          store.registrationRequestId ?? matchingRequest.id,
      };
    });

    const existingStoreIds = new Set(
      mergedStores
        .map((store) => getId(store))
        .filter((id) => id != null)
        .map(String),
    );
    const existingRequestIds = new Set(
      mergedStores
        .map((store) => store.registrationRequestId)
        .filter((id) => id != null)
        .map(String),
    );
    const existingNames = new Set(
      mergedStores
        .map((store) => getStoreName(store).trim().toLowerCase())
        .filter(Boolean),
    );

    const registrationStores = registrations
      .filter((request) => {
        const status = String(request.status || "").toUpperCase();
        if (status === "REJECTED") return false;

        const requestId = getId(request);
        const createdStoreId = request.createdStoreId;
        const storeName = String(request.storeName || "").trim().toLowerCase();

        return !(
          (createdStoreId != null && existingStoreIds.has(String(createdStoreId))) ||
          (requestId != null && existingRequestIds.has(String(requestId))) ||
          (storeName && existingNames.has(storeName))
        );
      })
      .map((request) => ({
        id: request.createdStoreId || `registration-${getRegistrationStoreId(request)}`,
        _id: request.createdStoreId || `registration-${getRegistrationStoreId(request)}`,
        brand: request.storeName,
        storeName: request.storeName,
        storeType: request.storeType,
        status: request.status || "PENDING",
        subscriptionPlan: normalizePlan(request.subscriptionPlan),
        estimatedBranches: request.estimatedBranches ?? 1,
        estimatedUsers: request.estimatedUsers ?? 1,
        fullName: request.ownerName,
        ownerName: request.ownerName,
        storeAddress: request.storeAddress,
        email: request.email,
        phone: request.phone,
        description: request.storeDescription,
        registrationRequestId: getId(request),
        paymentStatus: request.paymentStatus,
        subscriptionPurchaseDate:
          request.subscriptionPurchaseDate ||
          request.purchaseDate ||
          request.paidAt ||
          request.paymentDate ||
          request.approvedAt ||
          request.createdAt,
        subscriptionExpiry:
          request.subscriptionExpiry ||
          request.subscriptionExpiryDate ||
          request.expiryDate ||
          request.expiresAt,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        isRegistrationOnly: !request.createdStoreId,
      }));

    return [...mergedStores, ...registrationStores];
  } catch (error) {
    console.warn("Could not merge registration data:", error);
    return storeList;
  }
};

export const resolveSubscriptionPlan = (store) => {
  const directPlan = normalizePlan(store?.subscriptionPlan);
  console.log("[PLAN RESOLVER] Store:", store?.brand || store?._id, 
    "| subscriptionPlan field:", store?.subscriptionPlan, 
    "| normalized:", directPlan,
    "| branches:", store?.estimatedBranches ?? store?.branches?.length,
    "| users:", store?.estimatedUsers ?? store?.employees?.length);
  
  if (directPlan) {
    console.log("[PLAN RESOLVER] Using direct plan:", directPlan);
    return directPlan;
  }

  const branches = store?.estimatedBranches ?? store?.branches?.length ?? 1;
  const users = store?.estimatedUsers ?? store?.employees?.length ?? 1;

  let resolvedPlan;
  if (branches > 10 || users > 50) {
    resolvedPlan = "ENTERPRISE";
  } else if (branches > 3 || users > 15) {
    resolvedPlan = "PROFESSIONAL";
  } else {
    resolvedPlan = "BASIC";
  }
  
  console.log("[PLAN RESOLVER] Using heuristic, resolved to:", resolvedPlan);
  return resolvedPlan;
};

export { mergeRegistrationDataWithStores, normalizePlan, getStoreName };
