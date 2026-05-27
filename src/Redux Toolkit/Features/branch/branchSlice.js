import { createSlice } from "@reduxjs/toolkit";
import {
  createBranch,
  getBranchById,
  getBranchesByStore,
  updateBranch,
} from "./branchThunk";
const initialState = {
  branch: null,
  branches: [],
  employees: [],
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
        if (state.branch?.id === action.payload?.id) {
          state.branch = action.payload;
        }
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get branch by id
      .addCase(getBranchById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBranchById.fulfilled, (state, action) => {
        state.loading = false;
        state.branch = action.payload;
      })
      .addCase(getBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //get all branch by store
      .addCase(getBranchesByStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBranchesByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(getBranchesByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const branchId = action.payload.id || action.payload._id;
        const index = state.branches.findIndex(b => (b.id || b._id) === branchId);
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
        if ((state.branch?.id || state.branch?._id) === branchId) {
          state.branch = action.payload;
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchSlice.reducer;