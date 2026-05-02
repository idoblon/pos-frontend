import { createSlice } from "@reduxjs/toolkit";
import { signup, login } from "./authThunk";

const authSlice = createSlice({
  name:"auth",
  initialState:{
    user:null,
    loading:false,
    error:null
  },
  reducers:{
    logout:(state)=>{
      state.user=null;
      localStorage.removeItem("jwt")
    }
  },
  extraReducers:(builder)=>{
    builder
    .addCase(signup.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    .addCase(signup.fulfilled,(state,action)=>{
      state.loading=false;
      state.user=action.payload;
    })
    .addCase(signup.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
    .addCase(login.pending,(state)=>{
      state.loading=true;
      state.error=null;
    })
    .addCase(login.fulfilled,(state,action)=>{
      state.loading=false;
      state.user=action.payload;
    })
    .addCase(login.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    })
  }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;