import { IPermission } from "types/backend";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchPermission } from "api/services";

interface IState {
  isFetching: boolean;
  data: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IPermission[];
}

// First, create the thunk
export const fetchPermission = createAsyncThunk(
  "permission/fetchPermission",
  async ({ query }: { query: string }) => {
    const response = await callFetchPermission(query);
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

export const permissionSlide = createSlice({
  name: "permission",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchPermission.pending, (state, action) => {
      state.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchPermission.rejected, (state, action) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchPermission.fulfilled, (state, action) => {
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

// export const {/* actionName*/ } = permissionSlide.actions;

export default permissionSlide.reducer;
