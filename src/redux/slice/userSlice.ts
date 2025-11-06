import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchUser } from "../../api/services";
import { IUser } from "types/backend";

interface IState {
  isFetching: boolean;
  data: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IUser[];
}

// First, create the thunk
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async ({ query }: { query: string }) => {
    const response = await callFetchUser(query);
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

export const userSlide = createSlice({
  name: "user",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchUser.pending, (state) => {
      state.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchUser.rejected, (state) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchUser.fulfilled, (state, action) => {
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

export default userSlide.reducer;
