// import axios from "axios";
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import API_BASE_URL from "../../../config/api"; // ✅ Import API URL

// const initialState = {
//   cartItems: [],
//   isLoading: false,
// };

// export const addToCart = createAsyncThunk(
//   "cart/addToCart",
//   async ({ userId, productId, quantity }) => {
//     const response = await axios.post(
//       `${API_BASE_URL}/api/shop/cart/add`, // ✅ Use API_BASE_URL
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );
//     return response.data;
//   }
// );

// export const fetchCartItems = createAsyncThunk(
//   "cart/fetchCartItems",
//   async (userId) => {
//     const response = await axios.get(
//       `${API_BASE_URL}/api/shop/cart/get/${userId}` // ✅ Use API_BASE_URL
//     );
//     return response.data;
//   }
// );

// export const deleteCartItem = createAsyncThunk(
//   "cart/deleteCartItem",
//   async ({ userId, productId }) => {
//     const response = await axios.delete(
//       `${API_BASE_URL}/api/shop/cart/${userId}/${productId}` // ✅ Use API_BASE_URL
//     );
//     return response.data;
//   }
// );

// export const updateCartQuantity = createAsyncThunk(
//   "cart/updateCartQuantity",
//   async ({ userId, productId, quantity }) => {
//     const response = await axios.put(
//       `${API_BASE_URL}/api/shop/cart/update-cart`, // ✅ Use API_BASE_URL
//       {
//         userId,
//         productId,
//         quantity,
//       }
//     );
//     return response.data;
//   }
// );

// const shoppingCartSlice = createSlice({
//   name: "shoppingCart",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(addToCart.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(addToCart.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(addToCart.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(fetchCartItems.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchCartItems.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(fetchCartItems.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(updateCartQuantity.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(updateCartQuantity.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(updateCartQuantity.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       })
//       .addCase(deleteCartItem.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(deleteCartItem.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.cartItems = action.payload.data;
//       })
//       .addCase(deleteCartItem.rejected, (state) => {
//         state.isLoading = false;
//         state.cartItems = [];
//       });
//   },
// });

// export default shoppingCartSlice.reducer;
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "../../../config/api"; // ✅ Import API URL
import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from "@/utils/localStorageUtils"; // ✅ Import localStorage utils

const initialState = {
  cartItems: getFromLocalStorage("cart") || [], // ✅ Load from localStorage for guests
  isLoading: false,
  isAuthenticated: false, // ✅ Tracks if user is logged in
};

// 🔹 Fetch Cart Items (For Logged-in Users)
export const fetchCartItems = createAsyncThunk("cart/fetchCartItems", async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/shop/cart/get/${userId}`);
  return response.data;
});

// 🔹 Add to Cart (Supports Both Guest & Logged-in Users)
export const addToCart = createAsyncThunk("cart/addToCart", async ({ userId, productId, quantity }, { getState }) => {
  const { isAuthenticated, cartItems } = getState().shoppingCart;

  if (isAuthenticated) {
    const response = await axios.post(`${API_BASE_URL}/api/shop/cart/add`, { userId, productId, quantity });
    return response.data;
  } else {
    // ✅ Handle guest user
    let updatedCart = [...cartItems];
    const itemIndex = updatedCart.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      updatedCart[itemIndex].quantity += quantity;
    } else {
      updatedCart.push({ productId, quantity });
    }

    saveToLocalStorage("cart", updatedCart);
    return { data: updatedCart }; // ✅ Mimic API response
  }
});

// 🔹 Update Cart Quantity (Supports Both Guest & Logged-in Users)
export const updateCartQuantity = createAsyncThunk("cart/updateCartQuantity", async ({ userId, productId, quantity }, { getState }) => {
  const { isAuthenticated, cartItems } = getState().shoppingCart;

  if (isAuthenticated) {
    const response = await axios.put(`${API_BASE_URL}/api/shop/cart/update-cart`, { userId, productId, quantity });
    return response.data;
  } else {
    // ✅ Handle guest user
    let updatedCart = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    saveToLocalStorage("cart", updatedCart);
    return { data: updatedCart }; // ✅ Mimic API response
  }
});

// 🔹 Delete Cart Item (Supports Both Guest & Logged-in Users)
export const deleteCartItem = createAsyncThunk("cart/deleteCartItem", async ({ userId, productId }, { getState }) => {
  const { isAuthenticated, cartItems } = getState().shoppingCart;

  if (isAuthenticated) {
    const response = await axios.delete(`${API_BASE_URL}/api/shop/cart/${userId}/${productId}`);
    return response.data;
  } else {
    // ✅ Handle guest user
    let updatedCart = cartItems.filter((item) => item.productId !== productId);

    saveToLocalStorage("cart", updatedCart);
    return { data: updatedCart }; // ✅ Mimic API response
  }
});

// 🔹 Merge LocalStorage Cart to Backend when User Logs In
export const syncGuestCartToBackend = createAsyncThunk("cart/syncGuestCartToBackend", async (userId, { getState, dispatch }) => {
  const { cartItems } = getState().shoppingCart;

  if (cartItems.length > 0) {
    await axios.post(`${API_BASE_URL}/api/shop/cart/merge`, { userId, cartItems });
    removeFromLocalStorage("cart"); // ✅ Clear guest cart after syncing
    dispatch(fetchCartItems(userId)); // ✅ Fetch updated cart
  }
});

// 🔹 Shopping Cart Slice (Handles LocalStorage & Backend Sync)
const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    setAuthentication: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload.data;
        saveToLocalStorage("cart", action.payload.data);
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cartItems = action.payload.data;
        saveToLocalStorage("cart", action.payload.data);
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.cartItems = action.payload.data;
        saveToLocalStorage("cart", action.payload.data);
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.cartItems = action.payload.data;
        saveToLocalStorage("cart", action.payload.data);
      })
      .addCase(syncGuestCartToBackend.fulfilled, (state) => {
        state.cartItems = [];
      });
  },
});

export const { setAuthentication } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
