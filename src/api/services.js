import axios from './axios';

/**
 *
 *Module Auth
 */

export const callRegister = (email, password, confirmPassword, fullName) => {
  const data = {
    email: email,
    password: password,
    confirmPassword: confirmPassword,
    fullName: fullName
  }
  return axios.post('/auth/register', data)
}

export const callLogin = (email, password) => {
  const data = {
    email: email,
    password: password
  }
  return axios.post('/auth/login', data)
}

export const callVerifyEmail = (email, token) => {
  return axios.get(`/auth/verify?email=${email}&token=${token}`);
}

export const callResendToken = (email) => {
  return axios.get(`/auth/resend-token?email=${email}`);
}

export const callSendTokenResetPassword = (email) => {
  return axios.get(`/auth/send-reset-token?email=${email}`);
}

export const callResetPassword = (token, request) => {
  return axios.post(`/auth/reset-password?token=${token}`, {
    newPassword: request.newPassword,
    confirmPassword: request.confirmPassword
  });
}

export const callFetchAccount = () => {
  return axios.get('/auth/account');
}

export const callRefreshToken = () => {
  return axios.get('/auth/refresh')
}

export const callLogout = () => {
  return axios.post('/auth/logout')
}

/**
 *
 *Module User
 */

export const callCreateUser = (userData) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append('fullName', userData.fullName);
  if (userData.email) formData.append('email', userData.email);
  if (userData.password) formData.append('password', userData.password);

  // Xử lý file image
  if (userData.image) formData.append('image', userData.image);

  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('userDOB', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('userDOB', userData.userDOB);
    }
  }

  if (userData.address) formData.append('address', userData.address);
  if (userData.status) formData.append('status', userData.status);
  if (userData.roleId !== undefined) formData.append('roleId', userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.post('/user/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callUpdateUser = (userData, userId) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append('fullName', userData.fullName);

  // Xử lý file image hoặc flag xóa image
  if (userData.image) {
    formData.append('image', userData.image);
  } else if (userData.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append('deleteImage', 'true');
  }

  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('userDOB', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('userDOB', userData.userDOB);
    }
  }

  if (userData.address) formData.append('address', userData.address);
  if (userData.status) formData.append('status', userData.status);
  if (userData.roleId !== undefined) formData.append('roleId', userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.put(`/user/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callUpdateUserProfile = (userData) => {
  // Tạo FormData object
  const formData = new FormData();
  if (userData.fullName) formData.append('fullName', userData.fullName);
  // Xử lý file image hoặc flag xóa image
  if (userData.image) {
    formData.append('image', userData.image);
  } else if (userData.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append('deleteImage', 'true');
  }
  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('userDOB', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('userDOB', userData.userDOB);
    }
  }
  if (userData.address) formData.append('address', userData.address);
  return axios.put(`/user/change-info`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callDeleteUser = (id) => {
  return axios.delete(`/user/${id}`);
}

export const callFetchUser = (query) => {
  return axios.get(`/user/list?${query}`);
}

export const callFetchUserDetail = (id) => {
  return axios.get(`/user/${id}`);
}

export const callFetchUserProfile = (id) => {
  return axios.get(`/user/profile/${id}`);
}

//API change password
export const callChangePassword = (data) => {
  return axios.patch(`/user/change-password`, {
    oldPassword: data.oldPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword
  });
}

/**
 *
 *Module Book
 */

export const callCreateBook = (data) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  // Xử lý file image
  if (data.image) formData.append('image', data.image);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (data.publishedDate) {
    // Nếu là Date object
    if (data.publishedDate instanceof Date) {
      const isoDate = data.publishedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('publishedDate', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('publishedDate', data.publishedDate);
    }
  }

  if (data.bookFormat) formData.append('bookFormat', data.bookFormat);
  if (data.bookSaleLink) formData.append('bookSaleLink', data.bookSaleLink);
  if (data.author) formData.append('author', data.author);

  if (data.language) formData.append('language', data.language);
  if (data.status) formData.append('status', data.status);
  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach(categoryId => {
        formData.append('categoryIds', categoryId);
      });
    } else {
      formData.append('categoryIds', data.categoryIds);
    }
  }
  // Gửi request với content-type là multipart/form-data
  return axios.post('/book/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callUpdateBook = (data, id) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  // Xử lý file image hoặc flag xóa image
  if (data.image) {
    formData.append('image', data.image);
  } else if (data.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append('deleteImage', 'true');
  }
  if (data.publishedDate) {
    formData.append('publishedDate', data.publishedDate);
  }

  if (data.bookFormat) formData.append('bookFormat', data.bookFormat);
  if (data.bookSaleLink) formData.append('bookSaleLink', data.bookSaleLink);

  if (data.language) formData.append('language', data.language);
  if (data.author) formData.append('author', data.author);
  if (data.status) formData.append('status', data.status);

  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach(categoryId => {
        formData.append('categoryIds', categoryId);
      });
    } else {
      formData.append('categoryIds', data.categoryIds);
    }
  }
  // Gửi request với content-type là multipart/form-data
  return axios.put(`/book/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callDeleteBook = (id) => {
  return axios.delete(`/book/${id}`);
}

export const callFetchBook = (query) => {
  return axios.get(`/book/list?${query}`);
}

export const callGetBookById = (id) => {
  return axios.get(`/book/${id}`);
}

export const callGetBookDetailById = (id) => {
  return axios.get(`/book/detail-book/${id}`);
}

// get post by id
export const callGetPostById = (id) => {
  return axios.get(`/book/detail-post/${id}`);
}


// API mới để lấy danh sách sách cần duyệt
export const callGetApproveBooks = (query) => {
  return axios.get(`/book/list-none?${query}`);
}

// API duyệt sách
export const callApproveBook = (bookId) => {
  return axios.patch(`/book/approve/${bookId}`);
}

// API từ chối sách
export const callRejectBook = (bookId) => {
  return axios.patch(`/book/reject/${bookId}`);
}

// API upload sách
export const callUploadBook = (data) => {
  // Tạo FormData object
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  // Xử lý file image
  if (data.image) formData.append('image', data.image);
  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (data.publishedDate) {
    // Nếu là Date object
    if (data.publishedDate instanceof Date) {
      const isoDate = data.publishedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('publishedDate', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('publishedDate', data.publishedDate);
    }
  }

  if (data.bookFormat) formData.append('bookFormat', data.bookFormat);
  if (data.bookSaleLink) formData.append('bookSaleLink', data.bookSaleLink);
  if (data.author) formData.append('author', data.author);

  if (data.language) formData.append('language', data.language);
  if (data.categoryIds) {
    if (Array.isArray(data.categoryIds)) {
      data.categoryIds.forEach(categoryId => {
        formData.append('categoryIds', categoryId);
      });
    } else {
      formData.append('categoryIds', data.categoryIds);
    }
  }
  return axios.post('/book/upload-post', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

//API call fetch all post of user
export const callGetAllPostOfUser = (email, query) => {
  return axios.get(`/book/list-book-user?email=${encodeURIComponent(email)}${query ? `&${query}` : ''}`);
}

//API like book
export const callLikeBook = (bookId) => {
  return axios.post(`/favorite-book/?bookId=${bookId}`);
}

//API delete favorite book
export const callDeleteFavoriteBook = (bookId) => {
  return axios.delete(`/favorite-book/?bookId=${bookId}`);
}

//API fetch all favorite of user
export const callGetAllFavoriteOfUser = (query) => {
  return axios.get(`/favorite-book/list-of-user?${query}`);
}

//API fetch all book favorite of user
export const callFetchAllBookFavoriteOfUser = (userId, query) => {
  return axios.get(`/favorite-book/books-of-user/${userId}?${query}`);
}

/**
 *
Module Role
 */
export const callCreateRole = (role) => {
  return axios.post('/role/', {
    name: role.name,
    description: role.description,
    permissions: role.permissions
  })
}

export const callUpdateRole = (role, id) => {
  return axios.put(`/role/${id}`, {
    name: role.name,
    description: role.description,
    active: role.isActive,
    permissions: role.permissions
  })
}

export const callDeleteRole = (id) => {
  return axios.delete(`/role/${id}`);
}

export const callFetchRole = (query) => {
  return axios.get(`/role/list?${query}`);
}

export const callFetchRoleById = (id) => {
  return axios.get(`/role/${id}`);
}

/**
 *
Module Permission
 */
export const callCreatePermission = (permission) => {
  return axios.post('/permission/', {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module
  })
}

export const callUpdatePermission = (permission, id) => {
  return axios.put(`/permission/${id}`, {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module
  })
}

export const callDeletePermission = (id) => {
  return axios.delete(`/permission/${id}`);
}

export const callFetchPermission = (query) => {
  return axios.get(`/permission/list?${query}`);
}

export const callFetchPermissionById = (id) => {
  return axios.get(`/permission/${id}`);
}

/**
 *
 *Module Category
 */

export const callCreateCategory = (data) => {
  // Tạo FormData object
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);

  // Xử lý file image
  if (data.image) formData.append('image', data.image);


  // Gửi request với content-type là multipart/form-data
  return axios.post('/category/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callUpdateCategory = (data, id) => {
  // Tạo FormData object
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);

  // Xử lý file image hoặc flag xóa image
  if (data.image) {
    formData.append('image', data.image);
  } else if (data.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append('deleteImage', 'true');
  }
  return axios.put(`/category/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callDeleteCategory = (id) => {
  return axios.delete(`/category/${id}`);
}

export const callFetchCategory = (query) => {
  return axios.get(`/category/list?${query}`);
}

export const callFetchCategoriesUpload = (query) => {
  return axios.get(`/category/list-upload?${query}`);
}



/**
 *
Module Follow
 */
export const callCreateFollow = (follow) => {
  return axios.post(`/follow/?followerId=${follow.followerId}&followingId=${follow.followingId}`);
}

//delete follow
export const callDeleteFollow = (id) => {
  return axios.delete(`/follow/${id}`);
}

//unfollow
export const calUnfollow = (follow) => {
  return axios.delete(`/follow/?followerId=${follow.followerId}&followingId=${follow.followingId}`);
}

export const callFetchFollow = (query) => {
  return axios.get(`/follow/list?${query}`);
}

//API get list user account following
export const callFetchFollowing = (query) => {
  return axios.get(`/follow/list-following?${query}`);
}

/**
 *
Module Rating
 */
export const callCreateRating = (rating) => {
  return axios.post(`/review/rating`, {
    userId: rating.userId,
    bookId: rating.bookId,
    stars: rating.stars
  });
}

export const callUpdateRating = (rating, id) => {
  return axios.put(`/review/rating/${id}?stars=${rating.stars}`);
}

export const callDeleteRating = (id) => {
  return axios.delete(`/review/rating/${id}`);
}

export const callFetchRating = (query) => {
  return axios.get(`/review/rating/list?${query}`);
}

/**
 *
Module Comment
 */
export const callCreateComment = (comment) => {
  return axios.post(`/review/comment`, {
    userId: comment.userId,
    bookId: comment.bookId,
    comment: comment.comment,
    ratingComment: comment.ratingComment
  });
}

export const callUpdateComment = (comment, id) => {
  return axios.put(`/review/comment/${id}`, {
    comment: comment.comment,
    ratingComment: comment.ratingComment
  });
}

export const callDeleteComment = (id) => {
  return axios.delete(`/review/comment/${id}`);
}

export const callFetchComment = (query) => {
  return axios.get(`/review/comment/list?${query}`);
}

/**
 *
Module Review
 */
export const callCreateReview = (review, bookId) => {
  return axios.post(`/review/${bookId}`, {
    stars: review.stars,
    comment: review.comment,
  });
}

export const callDeleteReview = (commentId, ratingId) => {
  let url = `/review/?ratingId=${ratingId}`;
  if (commentId) {
    url += `&commentId=${commentId}`;
  }
  return axios.delete(url);
}

export const callUpdateReview = (commentId, ratingId, review) => {
  let url = '/review/update-review?';

  if (ratingId) {
    url += `ratingId=${ratingId}`;
  }

  if (commentId) {
    url += `${ratingId ? '&' : ''}commentId=${commentId}`;
  }
  // console.log("url: ", url)
  return axios.put(url, {
    stars: review.stars,
    comment: review.comment
  });
}

/**
 * Home Page
 */
export const callGetHomeBooks = (query) => {
  return axios.get(`/book/home-page?${query}`);
}

/**
 * Explore Page
 */
export const callGetExploreBooks = (query) => {
  return axios.get(`/book/explore?${query}`);
}

/**
 * Search Home Page
 */
export const callSearchHomeBook = (query) => {
  return axios.get(`/book/search?${query}`);
}

/**
 * Search User
 */
export const callSearchUser = (query) => {
  return axios.get(`/user/search?${query}`);
}