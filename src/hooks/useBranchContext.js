import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import secureStorage from "@/util/secureStorage";

/**
 * Single branch/store context for branch scope.
 * Precedence: getUserProfile (server truth) → auth session → sessionStorage.
 * Storage-only reads go stale after re-login; the profile fetch fixes that.
 */
export default function useBranchContext() {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
  const { user } = useSelector((s) => s.auth);
  const userData = secureStorage.getUserData();

  const branchId = userProfile?.branchId ?? user?.branchId ?? userData?.branchId;
  const storeId = userProfile?.storeId ?? user?.storeId ?? userData?.storeId;

  useEffect(() => {
    if (!userProfile) {
      dispatch(getUserProfile()).catch?.(() => {});
    }
  }, [dispatch, userProfile]);

  return { branchId, storeId, userProfile, user, userData };
}
