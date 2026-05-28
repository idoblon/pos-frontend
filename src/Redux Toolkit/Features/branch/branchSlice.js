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
        console.log("Branch slice - received payload:", action.payload);
        console.log("Branch slice - payload type:", typeof action.payload);
        console.log("Branch slice - is array:", Array.isArray(action.payload));
        
        // Handle if backend returns wrapped data
        if (action.payload && typeof action.payload === 'object') {
          if (Array.isArray(action.payload)) {
            state.branches = action.payload;
          } else if (action.payload.data && Array.isArray(action.payload.data)) {
            state.branches = action.payload.data;
          } else if (action.payload.branches && Array.isArray(action.payload.branches)) {
            state.branches = action.payload.branches;
          } else {
            console.warn("Unexpected branch data format:", action.payload);
            state.branches = [];
          }
        } else {
          state.branches = [];
        }
        
        console.log("Branch slice - final branches:", state.branches);
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