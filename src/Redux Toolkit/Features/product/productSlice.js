import { createSlice } from "@reduxjs/toolkit";
import { createProduct, getProductById, updateProduct, deleteProduct, getProductsByStore, getProductsByBranch, searchProducts} from "./productThunk";

const initialState = {
  products: [],
  product:null,
  searchResult:[],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (state.products?.content) {
          state.products.content.push(action.payload);
        } else if (Array.isArray(state.products)) {
          state.products.push(action.payload);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get product by Id
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const productList = state.products?.content || state.products || [];
        const index = productList.findIndex(
          (product) => product.id === action.payload.id,
        );
        if (index !== -1) {
          productList[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (state.products?.content) {
          state.products.content = state.products.content.filter(
            (product) => product.id !== action.payload.id,
          );
        } else if (Array.isArray(state.products)) {
          state.products = state.products.filter(
            (product) => product.id !== action.payload.id,
          );
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get products by store
      .addCase(getProductsByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProductsByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get products by branch
      .addCase(getProductsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProductsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) =>{
        state.loading = false;
        state.error = action.payload;

      })
  },
});

export default productSlice.reducer;
