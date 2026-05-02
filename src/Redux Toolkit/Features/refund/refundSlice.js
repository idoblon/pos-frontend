import { createSlice } from "@reduxjs/toolkit";
import { createRefund, getRefundsByBranch } from "./refundThunk";
import { stat } from "node:fs";

const initialState = {
  refunds: [],
  refundsByCashier: [],
  refundsByBranch: [],
  refundsByShift: [],
  refundsByDateRange: [],
  selectedRefund: null,
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
      // all refund
      .addCase(getAllRefund.pending, (state)=>{
        state.loading=true;
        state.error=null;
      })
      .addCase(getAllRefund.fulfilled,(state,action)=>{
        state.loading=false;
        state.refunds=action.payload;
      })
      .addCase(getAllRefund.rejected,(state,action)=>{
        state.loading=false;
        state.error=action.payload;
      })
      // get refunds by cashier
      .addCase(getRefundsByCashier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundsByCashier.fulfilled, (state, action) => {
        state.loading = false;
        state.refundsByCashier = action.payload;
      })
      .addCase(getRefundsByCashier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get refunds by branch
      .addCase(getRefundsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.refundsByBranch = action.payload;
      })
      .addCase(getRefundsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get refunds by shift
      .addCase(getRefundsByShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundsByShift.fulfilled, (state, action) => {
        state.loading = false;
        state.refundsByShift = action.payload;
      })
      .addCase(getRefundsByShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get refunds by date range
      .addCase(getRefundByCashierAndDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundByCashierAndDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.refundsByDateRange = action.payload;
      })
      .addCase(getRefundByCashierAndDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get refund by id
      .addCase(getRefundById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRefundById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRefund = action.payload;
      })
      .addCase(getRefundById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
  },
});

export default refundSlice.reducer;
