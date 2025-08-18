import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchAccount } from './../../api/services';

// First, create the thunk
export const fetchAccount = createAsyncThunk(
    'account/fetchAccount',
    async () => {
        const response = await callFetchAccount();
        return response.data;
    }
)
const token = localStorage.getItem('access_token');
const initialState = {
    isAuthenticated: false,
    isLoading: !!token,
    isRefreshToken: false,
    errorRefreshToken: "",
    user: {
        id: "",
        email: "",
        fullName: "",
        image: "",
        role: {
            id: "",
            name: "",
            permissions: [],
        },
    },

    activeMenu: 'home'
};


export const accountSlide = createSlice({
    name: 'account',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            state.activeMenu = action.payload;
        },
        setUserLoginInfo: (state, action) => {
            state.isAuthenticated = true;
            state.isLoading = false;
            state.user.id = action?.payload?.id;
            state.user.email = action?.payload?.email;
            state.user.fullName = action?.payload?.fullName;
            state.user.image = action?.payload?.image;
            state.user.role = action?.payload?.role;

            if (!action?.payload?.role) state.user.role = {};
            state.user.role.permissions = action?.payload?.role?.permissions ?? [];
        },
        setLogoutAction: (state, action) => {
            state.isAuthenticated = false;
            state.user = {
                id: "",
                email: "",
                fullName: "",
                role: {
                    id: "",
                    name: "",
                    permissions: [],
                },
            }
        },
        setRefreshTokenAction: (state, action) => {
            state.isRefreshToken = action.payload?.status ?? false;
            state.errorRefreshToken = action.payload?.message ?? "";
        }

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchAccount.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(fetchAccount.fulfilled, (state, action) => {
            if (action.payload) {
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user.id = action?.payload?.id;
                state.user.email = action.payload.email;
                state.user.fullName = action.payload.fullName;
                state.user.image = action.payload.image;
                state.user.role = action?.payload?.role;
                if (!action?.payload?.role) state.user.role = {};
                state.user.role.permissions = action?.payload?.role?.permissions ?? [];
            }
        })

        builder.addCase(fetchAccount.rejected, (state, action) => {
            state.isAuthenticated = false;
            state.isLoading = false;
        })

    },

});

export const {
    setActiveMenu, setUserLoginInfo, setLogoutAction, setRefreshTokenAction
} = accountSlide.actions;

export default accountSlide.reducer;