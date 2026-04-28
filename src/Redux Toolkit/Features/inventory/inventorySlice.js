import { createSlice } from "@reduxjs/toolkit";
import { getInventoryByBranch } from "./inventoryThunk";

const initialState = {
  inventory: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInventoryByBranch.fulfilled, (state, action) => {
        state.inventory = action.payload;
      });
  },
});

export default inventorySlice.reducer;
