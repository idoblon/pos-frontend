import { createSlice } from "@reduxjs/toolkit";
import {
  createRestockRequest,
  getRestockRequestsByBranch,
  getRestockRequestsByStore,
  approveRestockRequest,
  rejectRestockRequest,
  fulfillRestockRequest,
  batchApproveRequests,
  batchFulfillRequests,
} from "./restockThunk";

const initialState = {
  requests: [],
  loading: false,
  error: null,
};

const restockSlice = createSlice({
  name: "restock",
  initialState,
  reducers: {
    clearRestockError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRestockRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRestockRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createRestockRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRestockRequestsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestockRequestsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(getRestockRequestsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRestockRequestsByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestockRequestsByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(getRestockRequestsByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveRestockRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(rejectRestockRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(fulfillRestockRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(batchApproveRequests.fulfilled, (state, action) => {
        action.payload.forEach(updatedReq => {
          const index = state.requests.findIndex(req => req.id === updatedReq.id);
          if (index !== -1) {
            state.requests[index] = updatedReq;
          }
        });
      })
      .addCase(batchFulfillRequests.fulfilled, (state, action) => {
        action.payload.forEach(updatedReq => {
          const index = state.requests.findIndex(req => req.id === updatedReq.id);
          if (index !== -1) {
            state.requests[index] = updatedReq;
          }
        });
      });
  },
});

export const { clearRestockError } = restockSlice.actions;
export default restockSlice.reducer;
