import {createSlice} from "@reduxjs/toolkit"; 
import {
  createStoreEmpoyee,
  createBranchEmpoyee,
  updateEmpoyee,
  deleteEmployee,
  findEmployeeById,
  findStoreEmployee,
  findBranchEmployee,
} from "./employeeThunk";

const initialState = {
  employees: [],
  employee: null,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createStoreEmpoyee.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStoreEmpoyee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(createStoreEmpoyee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create branch employee
      .addCase(createBranchEmpoyee.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBranchEmpoyee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(createBranchEmpoyee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update employee

      .addCase(updateEmpoyee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(
          (e) => e.did === action.payload,
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })

      // delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // find employee by id
      .addCase(findEmployeeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(findEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(findEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // find store employee
      .addCase(findStoreEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(findStoreEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(findStoreEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // find branch employee
      .addCase(findBranchEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(findBranchEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(findBranchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default employeeSlice.reducer;
