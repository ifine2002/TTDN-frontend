import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountReducer from "redux/slice/accountSlice";
import userReducer from "redux/slice/userSlice";
import permissionReducer from "redux/slice/permissionSlice";
import roleReducer from "redux/slice/roleSlice";
import categoryReducer from "redux/slice/categorySlice";
import bookReducer from "redux/slice/bookSlice";
import followReducer from "redux/slice/followSlice";
import ratingReducer from "redux/slice/ratingSlice";
import commentReducer from "redux/slice/commentSlice";
import favoriteReducer from "redux/slice/favoriteSlice";

// Tạo store
export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    permission: permissionReducer,
    role: roleReducer,
    follow: followReducer,
    book: bookReducer,
    category: categoryReducer,
    rating: ratingReducer,
    comment: commentReducer,
    favorite: favoriteReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
