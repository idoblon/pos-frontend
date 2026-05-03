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
        if (state.branch.id == action.payload) {
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
      // update branch

      .addCase(updateBranch.fulfilled, (state, action) => {
        state.branch = action.payload;
      });
  },
});

export default branchSlice.reducer;