import { IComment } from "types/backend";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchComment } from "api/services";

interface IState {
  isFetching: boolean;
  data: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IComment[];
}

// First, create the thunk
export const fetchComment = createAsyncThunk(
  "comment/fetchComment",
  async ({ query }: { query: string }) => {
    const response = await callFetchComment(query);
    return response;
  }
);

const initialState: IState = {
  isFetching: true,
  data: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
};

export const commentSlide = createSlice({
  name: "comment",
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
    builder.addCase(fetchComment.pending, (state, action) => {
      state.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchComment.rejected, (state, action) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchComment.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.isFetching = false;
        state.data = {
          page: action.payload.data.page,
          pageSize: action.payload.data.pageSize,
          pages: action.payload.data.totalPages,
          total: action.payload.data.totalElements,
        };
        state.result = action.payload.data.result;
      }
      // Add user to the state array

      // state.courseOrder = action.payload;
    });
  },
});

export const { setActiveMenu } = commentSlide.actions;

export default commentSlide.reducer;
