import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import userReducer from './slice/userSlice';
import permissionReducer from './slice/permissionSlice';
import roleReducer from './slice/roleSlice';
import categoryReducer from './slice/categorySlice';
import bookReducer from './slice/bookSlice';
import followReducer from './slice/followSlice';
import ratingReducer from './slice/ratingSlice';
import commentReducer from './slice/commentSlice';
import favoriteReducer from './slice/favoriteSlice';

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

// Export các tiện ích để sử dụng trong app
export const dispatch = store.dispatch;
export const getState = store.getState;

