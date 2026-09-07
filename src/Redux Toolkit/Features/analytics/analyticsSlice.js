import { createSlice } from "@reduxjs/toolkit";
import { getStoreAnalytics, getSalesChart, getTopProducts, getPaymentSummary, getPeakHours, getEmployeeAnalytics } from "./analyticsThunk";

const initialState = {
  summary: null,
  salesChart: [],
  topProducts: [],
  paymentSummary: [],
  peakHours: [],
  employees: [],
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(getStoreAnalytics.pending, pending)
      .addCase(getStoreAnalytics.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(getStoreAnalytics.rejected, rejected)

      .addCase(getSalesChart.pending, pending)
      .addCase(getSalesChart.fulfilled, (state, action) => { state.loading = false; state.salesChart = action.payload; })
      .addCase(getSalesChart.rejected, rejected)

      .addCase(getTopProducts.pending, pending)
      .addCase(getTopProducts.fulfilled, (state, action) => { state.loading = false; state.topProducts = action.payload; })
      .addCase(getTopProducts.rejected, rejected)

      .addCase(getPaymentSummary.pending, pending)
      .addCase(getPaymentSummary.fulfilled, (state, action) => { state.loading = false; state.paymentSummary = action.payload; })
      .addCase(getPaymentSummary.rejected, rejected)

      .addCase(getPeakHours.pending, pending)
      .addCase(getPeakHours.fulfilled, (state, action) => { state.loading = false; state.peakHours = action.payload; })
      .addCase(getPeakHours.rejected, rejected)

      .addCase(getEmployeeAnalytics.pending, pending)
      .addCase(getEmployeeAnalytics.fulfilled, (state, action) => { state.loading = false; state.employees = action.payload; })
      .addCase(getEmployeeAnalytics.rejected, rejected);
  },
});

export default analyticsSlice.reducer;
