import api from "@/util/api";

const normalizePlan = (plan) => {
  if (!plan) return null;
  return String(plan).trim().toUpperCase();
};

const getStoreName = (store) =>
  store?.brand || store?.storeName || store?.name || "";

const findMatchingRegistration = (store, registrations) => {
  const storeId = store?.id ?? store?._id;
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
  if (!Array.isArray(stores) || stores.length === 0) {
    return stores;
  }

  try {
    const regRes = await api.get("/api/admin/registration-requests", { headers });
    const registrations = Array.isArray(regRes.data) ? regRes.data : [];

    return stores.map((store) => {
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
        registrationRequestId:
          store.registrationRequestId ?? matchingRequest.id,
      };
    });
  } catch (error) {
    console.warn("Could not merge registration data:", error);
    return stores;
  }
};

export const resolveSubscriptionPlan = (store) => {
  const directPlan = normalizePlan(store?.subscriptionPlan);
  if (directPlan) {
    return directPlan;
  }

  const branches = store?.estimatedBranches ?? store?.branches?.length ?? 1;
  const users = store?.estimatedUsers ?? store?.employees?.length ?? 1;

  if (branches > 10 || users > 50) return "ENTERPRISE";
  if (branches > 3 || users > 15) return "PROFESSIONAL";
  return "BASIC";
};

export { mergeRegistrationDataWithStores, normalizePlan, getStoreName };
