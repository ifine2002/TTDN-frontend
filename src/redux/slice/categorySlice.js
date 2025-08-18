import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchCategory } from './../../api/services';

// First, create the thunk
export const fetchCategory = createAsyncThunk(
    'category/fetchCategory',
    async ({ query }) => {
        const response = await callFetchCategory(query);
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


export const categorySlide = createSlice({
    name: 'category',
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
        builder.addCase(fetchCategory.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchCategory.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchCategory.fulfilled, (state, action) => {
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
            // Add user to the state array

            // state.courseOrder = action.payload;
        })
    },

});

export const {
    setActiveMenu,
} = categorySlide.actions;

export default categorySlide.reducer;
