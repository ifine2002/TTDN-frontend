import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchFollow, callFetchFollowing } from './../../api/services';

// First, create the thunk
export const fetchFollow = createAsyncThunk(
    'follow/fetchFollow',
    async ({ query }) => {
        const response = await callFetchFollow(query);
        return response;
    }
)

//API get list user account following
export const fetchFollowing = createAsyncThunk(
    'follow/fetchFollowing',
    async ({ query }) => {
        const response = await callFetchFollowing(query);
        return response;
    }
)

const initialState = {
    isFetching: true,
    data: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};


export const followSlide = createSlice({
    name: 'follow',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },


    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchFollow.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchFollow.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchFollow.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.data = {
                    page: action.payload.data.page,
                    pageSize: action.payload.data.pageSize,
                    pages: action.payload.data.totalPages,
                    total: action.payload.data.totalElements
                };
                state.result = action.payload.data.result;
            }
        })

        // Thêm reducers cho fetchFollowing
        builder.addCase(fetchFollowing.pending, (state, action) => {
            state.isFetching = true;
        })

        builder.addCase(fetchFollowing.rejected, (state, action) => {
            state.isFetching = false;
        })

        builder.addCase(fetchFollowing.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.data = {
                    page: action.payload.data.page,
                    pageSize: action.payload.data.pageSize,
                    pages: action.payload.data.totalPages,
                    total: action.payload.data.totalElements
                };
                state.result = action.payload.data.result;
            }
        })
    },

});

export const {
    setActiveMenu,
} = followSlide.actions;

export default followSlide.reducer;
