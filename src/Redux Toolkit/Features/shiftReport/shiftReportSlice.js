import { createSlice } from "@reduxjs/toolkit";
import { getCurrentShiftProgress, getTodaysOrdersByBranch } from "./shiftReportThunk";

const initialState = {
  currentShift: null,
  todaysOrders: [],
  loading: false,
  error: null,
};

const shiftReportSlice = createSlice({
  name: "shiftReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentShiftProgress.fulfilled, (state, action) => {
        state.currentShift = action.payload;
      })
      .addCase(getTodaysOrdersByBranch.fulfilled, (state, action) => {
        state.todaysOrders = action.payload;
      });
  },
});

export default shiftReportSlice.reducer;
