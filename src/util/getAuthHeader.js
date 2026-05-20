import secureStorage from "@/util/secureStorage";

export const getAuthToken = () => {
  const jwt = secureStorage.getToken();
  if (!jwt) throw new Error("No jwt token found");
  return jwt;
};

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
});
