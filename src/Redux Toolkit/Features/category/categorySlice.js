import {createSlice} from "@reduxjs/toolkit";
import { createCategory, getCategoriesByStore, updateCategory, deleteCategory } from "./categoryThunk";



const initialState = {
  categories:[],
  loading:false,
  error:null
}

const categorySlice = createSlice({
  name:"category",
  initialState,
  reducers:{},
  extraReducers:(builder)=>{
    builder
    .addCase(createCategory.pending, (state)=>{
      state.loading = true;
    })
    .addCase(createCategory.fulfilled, (state, action)=>{
      state.loading = false;
      state.categories.push(action.payload)
    })
  .addCase(createCategory.rejected, (state, action)=>{
    state.loading = false;
    state.error = action.payload
  })
  //get category by stroe
  .addCase(getCategoriesByStore.pending, (state)=>{
    state.loading = true;
  })
  .addCase(getCategoriesByStore.fulfilled, (state, action)=>{
    state.loading = false;
    state.categories = action.payload
  })
  .addCase(getCategoriesByStore.rejected, (state, action)=>{
    state.loading = false;
    state.error = action.payload
  })
  // update category
  .addCase(updateCategory.pending, (state)=>{
    state.loading = true;
  })
  .addCase(updateCategory.fulfilled, (state, action)=>{
    state.loading = false;
    const index = state.categories.findIndex(cat=> cat.id === action.payload.id)
    if(index !== -1){
      state.categories[index] = action.payload
    }
  })
  .addCase(updateCategory.rejected, (state, action)=>{
    state.loading = false;
    state.error = action.payload
  })
  // delete category
  .addCase(deleteCategory.pending, (state)=>{
    state.loading = true;
  })
  .addCase(deleteCategory.fulfilled, (state, action)=>{
    state.loading = false;
    state.categories = state.categories.filter((c) => c.id !== action.payload.id)
  })
  .addCase(deleteCategory.rejected, (state, action)=>{
    state.loading = false;
    state.error = action.payload
  })
  }
})

export default categorySlice.reducer; 