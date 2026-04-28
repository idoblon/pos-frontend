import { createSlice } from "@reduxjs/toolkit";
import { createRefund, getRefundsByBranch } from "./refundThunk";

const initialState = {
  refunds: [],
  loading: false,
  error: null,
};

const refundSlice = createSlice({
  name: "refund",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createRefund.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRefund.fulfilled, (state, action) => {
        state.loading = false;
        state.refunds.push(action.payload);
      })
      .addCase(createRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRefundsByBranch.fulfilled, (state, action) => {
        state.refunds = action.payload;
      });
  },
});

export default refundSlice.reducer;
