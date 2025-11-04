import {
  IBackendRes,
  IAccount,
  IGetAccount,
  IUser,
  IModelPaginate,
  IBook,
  IBookAdmin,
  IPost,
  IFavorite,
  IBookSearch,
  IRole,
  IPermission,
  ICategory,
  IFollow,
  IRating,
  IComment,
  IDashboard,
} from "@/types/backend";
import axios from "./axios";

/**
 *
 *Module Auth
 */

export const callRegister = (
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string
) => {
  const data = {
    email: email,
    password: password,
    confirmPassword: confirmPassword,
    fullName: fullName,
  };
  return axios.post<IBackendRes<null>>("/auth/register", data);
};

export const callLogin = (email: string, password: string) => {
  const data = {
    email: email,
    password: password,
  };
  return axios.post<IBackendRes<IAccount>>("/auth/login", data);
};

export const callVerifyEmail = (email: string, token: string) => {
  return axios.get<IBackendRes<null>>(
    `/auth/verify?email=${email}&token=${token}`
  );
};

export const callResendToken = (email: string) => {
  return axios.get<IBackendRes<null>>(`/auth/resend-token?email=${email}`);
};

export const callSendTokenResetPassword = (email: string) => {
  return axios.get<IBackendRes<null>>(`/auth/send-reset-token?email=${email}`);
};

export const callResetPassword = (
  token: string,
  request: { newPassword: string; confirmPassword: string }
) => {
  return axios.post<IBackendRes<null>>(`/auth/reset-password?token=${token}`, {
    newPassword: request.newPassword,
    confirmPassword: request.confirmPassword,
  });
};

export const callFetchAccount = () => {
  return axios.get<IBackendRes<IGetAccount>>("/auth/account");
};

export const callRefreshToken = () => {
  return axios.get<IBackendRes<IAccount>>("/auth/refresh");
};

export const callLogout = () => {
  return axios.post<IBackendRes<null>>("/auth/logout");
};

/**
 *
 *Module User
 */

export const callCreateUser = (userData: IUser) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append("fullName", userData.fullName);
  if (userData.email) formData.append("email", userData.email);
  if (userData.password) formData.append("password", userData.password);

  // Xử lý file image
  if (userData.image) formData.append("image", userData.image);

  if (userData.phone) formData.append("phone", userData.phone);
  if (userData.gender) formData.append("gender", userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("userDOB", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("userDOB", userData.userDOB);
    }
  }

  if (userData.address) formData.append("address", userData.address);
  if (userData.status) formData.append("status", userData.status);
  if (userData.roleId !== undefined) formData.append("roleId", userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.post<IBackendRes<IUser>>("/user/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callUpdateUser = (userData: IUser, userId: string) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append("fullName", userData.fullName);

  // Xử lý file image hoặc flag xóa image
  if (userData.image) {
    formData.append("image", userData.image);
  } else if (userData.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append("deleteImage", "true");
  }

  if (userData.phone) formData.append("phone", userData.phone);
  if (userData.gender) formData.append("gender", userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("userDOB", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("userDOB", userData.userDOB);
    }
  }

  if (userData.address) formData.append("address", userData.address);
  if (userData.status) formData.append("status", userData.status);
  if (userData.roleId !== undefined) formData.append("roleId", userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.put<IBackendRes<IUser>>(`/user/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callUpdateUserProfile = (userData: IUser) => {
  // Tạo FormData object
  const formData = new FormData();
  if (userData.fullName) formData.append("fullName", userData.fullName);
  // Xử lý file image hoặc flag xóa image
  if (userData.image) {
    formData.append("image", userData.image);
  } else if (userData.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append("deleteImage", "true");
  }
  if (userData.phone) formData.append("phone", userData.phone);
  if (userData.gender) formData.append("gender", userData.gender);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("userDOB", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("userDOB", userData.userDOB);
    }
  }
  if (userData.address) formData.append("address", userData.address);
  return axios.put<IBackendRes<IUser>>(`/user/change-info`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callDeleteUser = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/user/${id}`);
};

export const callFetchUser = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/user/list?${query}`);
};

export const callFetchUserDetail = (id: string) => {
  return axios.get<IBackendRes<IUser>>(`/user/${id}`);
};

export const callFetchUserProfile = (id: string) => {
  return axios.get<IBackendRes<IUser>>(`/user/profile/${id}`);
};

//API change password
export const callChangePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  return axios.patch<IBackendRes<null>>(`/user/change-password`, {
    oldPassword: data.oldPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
};

/**
 *
 *Module Book
 */

export const callCreateBook = (data: IBook) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  // Xử lý file image
  if (data.image) formData.append("image", data.image);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (data.publishedDate) {
    // Nếu là Date object
    if (data.publishedDate instanceof Date) {
      const isoDate = data.publishedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("publishedDate", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("publishedDate", data.publishedDate);
    }
  }

  if (data.bookFormat) formData.append("bookFormat", data.bookFormat);
  if (data.bookSaleLink) formData.append("bookSaleLink", data.bookSaleLink);
  if (data.author) formData.append("author", data.author);

  if (data.language) formData.append("language", data.language);
  if (data.status) formData.append("status", data.status);
  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach((categoryId) => {
        formData.append("categoryIds", categoryId);
      });
    } else {
      formData.append("categoryIds", data.categoryIds);
    }
  }
  // Gửi request với content-type là multipart/form-data
  return axios.post<IBackendRes<IBook>>("/book/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callUpdateBook = (data: IBook, id: string) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  // Xử lý file image hoặc flag xóa image
  if (data.image) {
    formData.append("image", data.image);
  } else if (data.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append("deleteImage", "true");
  }
  if (data.publishedDate) {
    // Nếu là Date object
    if (data.publishedDate instanceof Date) {
      const isoDate = data.publishedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("publishedDate", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("publishedDate", data.publishedDate);
    }
  }

  if (data.bookFormat) formData.append("bookFormat", data.bookFormat);
  if (data.bookSaleLink) formData.append("bookSaleLink", data.bookSaleLink);

  if (data.language) formData.append("language", data.language);
  if (data.author) formData.append("author", data.author);
  if (data.status) formData.append("status", data.status);

  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach((categoryId) => {
        formData.append("categoryIds", categoryId);
      });
    } else {
      formData.append("categoryIds", data.categoryIds);
    }
  }
  // Gửi request với content-type là multipart/form-data
  return axios.put<IBackendRes<IBook>>(`/book/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callDeleteBook = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/book/${id}`);
};

export const callFetchBook = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IBook>>>(`/book/list?${query}`);
};

export const callGetBookById = (id: string) => {
  return axios.get<IBackendRes<IBook>>(`/book/${id}`);
};

export const callGetBookDetailById = (id: string) => {
  return axios.get<IBackendRes<IBook>>(`/book/detail-book/${id}`);
};

// API mới để lấy danh sách sách cần duyệt
export const callGetApproveBooks = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IBookAdmin>>>(
    `/book/list-none?${query}`
  );
};

// API duyệt sách
export const callApproveBook = (bookId: string) => {
  return axios.patch<IBackendRes<null>>(`/book/approve/${bookId}`);
};

// API từ chối sách
export const callRejectBook = (bookId: string) => {
  return axios.patch<IBackendRes<null>>(`/book/reject/${bookId}`);
};

// API upload sách
export const callUploadBook = (data: IBook) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  // Xử lý file image
  if (data.image) formData.append("image", data.image);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (data.publishedDate) {
    // Nếu là Date object
    if (data.publishedDate instanceof Date) {
      const isoDate = data.publishedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      formData.append("publishedDate", isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append("publishedDate", data.publishedDate);
    }
  }

  if (data.bookFormat) formData.append("bookFormat", data.bookFormat);
  if (data.bookSaleLink) formData.append("bookSaleLink", data.bookSaleLink);
  if (data.author) formData.append("author", data.author);

  if (data.language) formData.append("language", data.language);
  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach((categoryId) => {
        formData.append("categoryIds", categoryId);
      });
    } else {
      formData.append("categoryIds", data.categoryIds);
    }
  }
  return axios.post<IBackendRes<IBookAdmin>>("/book/upload-post", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//API call fetch all post of user
export const callGetAllPostOfUser = (email: string, query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPost>>>(
    `/book/list-book-user?email=${encodeURIComponent(email)}${
      query ? `&${query}` : ""
    }`
  );
};

/**
 *
 *Module Favorites
 */

//API like book
export const callLikeBook = (bookId: number) => {
  return axios.post<IBackendRes<IFavorite>>(`/favorite-book/?bookId=${bookId}`);
};

//API delete favorite book
export const callDeleteFavoriteBook = (bookId: number) => {
  return axios.delete<IBackendRes<null>>(`/favorite-book/?bookId=${bookId}`);
};

//API fetch all favorite of user
export const callGetAllFavoriteOfUser = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IFavorite>>>(
    `/favorite-book/list-of-user?${query}`
  );
};

//API fetch all book favorite of user
export const callFetchAllBookFavoriteOfUser = (
  userId: string,
  query: string
) => {
  return axios.get<IBackendRes<IModelPaginate<IBookSearch>>>(
    `/favorite-book/books-of-user/${userId}?${query}`
  );
};

/**
 *
Module Role
 */
export const callCreateRole = (role: IRole) => {
  return axios.post<IBackendRes<IRole>>("/role/", {
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  });
};

export const callUpdateRole = (role: IRole, id: string) => {
  return axios.put<IBackendRes<IRole>>(`/role/${id}`, {
    ...role,
  });
};

export const callDeleteRole = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/role/${id}`);
};

export const callFetchRole = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/role/list?${query}`);
};

export const callFetchRoleById = (id: string) => {
  return axios.get<IBackendRes<IRole>>(`/role/${id}`);
};

/**
 *
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
  return axios.post<IBackendRes<IPermission>>("/permission/", {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module,
  });
};

export const callUpdatePermission = (permission: IPermission, id: string) => {
  return axios.put<IBackendRes<IPermission>>(`/permission/${id}`, {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module,
  });
};

export const callDeletePermission = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/permission/${id}`);
};

export const callFetchPermission = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPermission>>>(
    `/permission/list?${query}`
  );
};

export const callFetchPermissionById = (id: string) => {
  return axios.get<IBackendRes<IPermission>>(`/permission/${id}`);
};

/**
 *
 *Module Category
 */

export const callCreateCategory = (data: ICategory) => {
  // Tạo FormData object
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);

  // Xử lý file image
  if (data.image) formData.append("image", data.image);

  // Gửi request với content-type là multipart/form-data
  return axios.post<IBackendRes<ICategory>>("/category/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callUpdateCategory = (data: ICategory, id: string) => {
  // Tạo FormData object
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);

  // Xử lý file image hoặc flag xóa image
  if (data.image) {
    formData.append("image", data.image);
  } else if (data.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append("deleteImage", "true");
  }
  return axios.put<IBackendRes<ICategory>>(`/category/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const callDeleteCategory = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/category/${id}`);
};

export const callFetchCategory = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    `/category/list?${query}`
  );
};

export const callFetchCategoriesUpload = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    `/category/list-upload?${query}`
  );
};

/**
 *
Module Follow
 */
export const callCreateFollow = (follow: IFollow) => {
  return axios.post<IBackendRes<IFollow>>(
    `/follow/?followerId=${follow.followerId}&followingId=${follow.followingId}`
  );
};

//delete follow
export const callDeleteFollow = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/follow/${id}`);
};

//unfollow
export const calUnfollow = (follow: IFollow) => {
  return axios.delete<IBackendRes<null>>(
    `/follow/?followerId=${follow.followerId}&followingId=${follow.followingId}`
  );
};

export const callFetchFollow = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IFollow>>>(
    `/follow/list?${query}`
  );
};

//API get list user account following
export const callFetchFollowing = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUser>>>(
    `/follow/list-following?${query}`
  );
};

/**
 *
Module Rating
 */
export const callCreateRating = (rating: IRating) => {
  return axios.post<IBackendRes<IRating>>(`/review/rating`, {
    userId: rating.userId,
    bookId: rating.bookId,
    stars: rating.stars,
  });
};

export const callUpdateRating = (rating: IRating, id: string) => {
  return axios.put<IBackendRes<IRating>>(
    `/review/rating/${id}?stars=${rating.stars}`
  );
};

export const callDeleteRating = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/review/rating/${id}`);
};

export const callFetchRating = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRating>>>(
    `/review/rating/list?${query}`
  );
};

/**
 *
Module Comment
 */
export const callCreateComment = (comment: IComment) => {
  return axios.post<IBackendRes<IComment>>(`/review/comment`, {
    userId: comment.userId,
    bookId: comment.bookId,
    comment: comment.comment,
    ratingComment: comment.ratingComment,
  });
};

export const callUpdateComment = (comment: IComment, id: string) => {
  return axios.put<IBackendRes<IComment>>(`/review/comment/${id}`, {
    comment: comment.comment,
    ratingComment: comment.ratingComment,
  });
};

export const callDeleteComment = (id: string) => {
  return axios.delete<IBackendRes<null>>(`/review/comment/${id}`);
};

export const callFetchComment = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IComment>>>(
    `/review/comment/list?${query}`
  );
};

/**
 *
Module Review
 */
export const callCreateReview = (
  review: { stars: number; comment: string },
  bookId: string
) => {
  return axios.post<IBackendRes<null>>(`/review/${bookId}`, {
    stars: review.stars,
    comment: review.comment,
  });
};

export const callDeleteReview = (commentId: string, ratingId: string) => {
  let url = `/review/?ratingId=${ratingId}`;
  if (commentId) {
    url += `&commentId=${commentId}`;
  }
  return axios.delete<IBackendRes<null>>(url);
};

export const callUpdateReview = (
  commentId: string,
  ratingId: string,
  review: { stars: number; comment: string }
) => {
  let url = "/review/update-review?";

  if (ratingId) {
    url += `ratingId=${ratingId}`;
  }

  if (commentId) {
    url += `${ratingId ? "&" : ""}commentId=${commentId}`;
  }
  // console.log("url: ", url)
  return axios.put<IBackendRes<null>>(url, {
    stars: review.stars,
    comment: review.comment,
  });
};

/**
 * Home Page
 */
export const callGetHomeBooks = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IPost>>>(
    `/book/home-page?${query}`
  );
};

/**
 * Explore Page
 */
export const callGetExploreBooks = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IBookSearch>>>(
    `/book/explore?${query}`
  );
};

/**
 * Search Home Page
 */
export const callSearchHomeBook = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IBookSearch>>>(
    `/book/search?${query}`
  );
};

/**
 * Search User
 */
export const callSearchUser = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/user/search?${query}`);
};

/**
 * Get statistics
 */
export const callGetDashboard = () => {
  return axios.get<IBackendRes<IDashboard>>(`/dashboard`);
};
