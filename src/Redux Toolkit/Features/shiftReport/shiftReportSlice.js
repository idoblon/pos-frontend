import { createSlice } from "@reduxjs/toolkit";
import {
  startShift,
  endShift,
  getCurrentShiftProgress,
  getShiftReportByDate,
  getShiftsByCashier,
  getShiftById,
  getShiftsByBranch,
} from "./shiftReportThunk";


const initialState = {
  shifts: [],
  currentShift: null,
  selectedShift: null,
  shiftsByCashier: [],
  shiftsByBranch: [],
  loading: false,
  error: null,
};

const shiftReportSlice = createSlice({
  name: "shiftReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(startShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(startShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // end shift
      .addCase(endShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(endShift.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentShift && state.currentShift.id === action.payload.id) {
          state.currentShift = action.payload;
        }
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.payload.id,
        );
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      })
      .addCase(endShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get current shift progess
      .addCase(getCurrentShiftProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentShiftProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(getCurrentShiftProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Do not clear currentShift on 404 - it may have been set by startShift
      })
      // get shift report by date
      .addCase(getShiftReportByDate.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShiftReportByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = action.payload;
      })
      .addCase(getShiftReportByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get shift by cashier
      .addCase(getShiftsByCashier.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShiftsByCashier.fulfilled, (state, action) => {
        state.loading = false;
        state.shiftsByCashier = action.payload;
      })
      .addCase(getShiftsByCashier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get shift by branch
      .addCase(getShiftsByBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShiftsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.shiftsByBranch = action.payload;
      })
      .addCase(getShiftsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get shift by id
      .addCase(getShiftById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getShiftById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedShift = action.payload;
      })
      .addCase(getShiftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shiftReportSlice.reducer;
