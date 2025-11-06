import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchFollow, callFetchFollowing } from "../../api/services";
import { IFollow, IUser } from "@/types/backend";

interface IState {
  follows: {
    isFetching: boolean;
    data: { page: number; pageSize: number; pages: number; total: number };
    result: IFollow[];
  };
  followings: {
    isFetching: boolean;
    data: { page: number; pageSize: number; pages: number; total: number };
    result: IUser[];
  };
}

// First, create the thunk
export const fetchFollow = createAsyncThunk(
  "follow/fetchFollow",
  async ({ query }: { query: string }) => {
    const response = await callFetchFollow(query);
    return response;
  }
);

//API get list user account following
export const fetchFollowing = createAsyncThunk(
  "follow/fetchFollowing",
  async ({ query }: { query: string }) => {
    const response = await callFetchFollowing(query);
    return response;
  }
);

const initialState: IState = {
  follows: {
    isFetching: false,
    data: { page: 1, pageSize: 10, pages: 0, total: 0 },
    result: [],
  },
  followings: {
    isFetching: false,
    data: { page: 1, pageSize: 10, pages: 0, total: 0 },
    result: [],
  },
};

export const followSlide = createSlice({
  name: "follow",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchFollow.pending, (state) => {
      state.follows.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchFollow.rejected, (state) => {
      state.follows.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchFollow.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.follows.isFetching = false;
        state.follows.data = {
          page: action.payload.data.page,
          pageSize: action.payload.data.pageSize,
          pages: action.payload.data.totalPages,
          total: action.payload.data.totalElements,
        };
        state.follows.result = action.payload.data.result;
      }
    });

    // Thêm reducers cho fetchFollowing
    builder.addCase(fetchFollowing.pending, (state) => {
      state.followings.isFetching = true;
    });

    builder.addCase(fetchFollowing.rejected, (state) => {
      state.followings.isFetching = false;
    });

    builder.addCase(fetchFollowing.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.followings.isFetching = false;
        state.followings.data = {
          page: action.payload.data.page,
          pageSize: action.payload.data.pageSize,
          pages: action.payload.data.totalPages,
          total: action.payload.data.totalElements,
        };
        state.followings.result = action.payload.data.result;
      }
    });
  },
});

export default followSlide.reducer;
