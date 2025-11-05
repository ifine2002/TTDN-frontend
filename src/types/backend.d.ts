export interface IBackendRes<T> {
  status: number;
  error?: string;
  message?: string | string[];
  data?: T;
}

export interface IModelPaginate<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;

  result: T[];
}

export interface IAccount {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    image: string;
    role: {
      id: string;
      name: string;
      permissions: {
        id: string;
        name: string;
        apiPath: string;
        method: string;
        module: string;
      }[];
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IGetAccount extends Omit<IAccount, "access_token"> {}

export interface IUser {
  id?: string;
  fullName: string;
  email?: string;
  password?: string;
  image?: string;
  phone?: string;
  gender?: string;
  userDOB?: string | Date;
  address?: string;
  status?: string;
  roleId?: string;
  role?: {
    id: string;
    name: string;
  };
  deleteImage?: boolean;
  follower?: number;
  following?: number;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBook {
  id?: number;
  name: string;
  description: string;
  image?: string | File;
  publishedDate: string | Date;
  author: string;
  language: string;
  bookFormat: string;
  bookSaleLink: string;
  status?: string;
  deleteImage?: boolean;
  categoryIds: number[];
  categories?: {
    id: string;
    name: string;
  }[];
  reviews?: IReviews[];
  stars?: IStars;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookAdmin {
  bookId: string;
  bookName: string;
  description: string;
  imageBook: string;
  publishedDate: string | Date;
  author: string;
  language: string;
  bookFormat: string;
  bookSaleLink: string;
  categories?: {
    id: string;
    name: string;
  }[];
  userId: string;
  fullName: string;
  avatar: string;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBookSearch {
  id: string;
  name: string;
  image: string;
  publishedDate: string;
  ratingCount: number;
  averageRating: number;
  author: string;
}

export interface IPost {
  bookId: string;
  name: string;
  bookImage: string;
  publishedDate: string;
  author: string;
  language: string;
  bookFormat: string;
  bookSaleLink: string;
  categories?: {
    id: string;
    name: string;
  }[];
  user?: {
    id: string;
    fullName: string;
    image: string;
  };
  reviews?: IReviews[];
  stars?: IStars;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReviews {
  fullName: string;
  image: string;
  ratingId: string;
  commentId: string;
  userId: number;
  stars: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStars {
  averageRating: number;
  ratingCount: number;
  totalOneStar: number;
  totalTwoStar: number;
  totalThreeStar: number;
  totalFourStar: number;
  totalFiveStar: number;
}

export interface IPagination {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface IPermission {
  id?: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IFavorite {
  id: number;
  userId: number;
  bookId: number;
  createdBy: string;
  createdAt: string;
}

export interface IRole {
  id?: string;
  name: string;
  description: string;
  active?: boolean;
  permissions: IPermission[] | string[];

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  deleteImage?: boolean;
  active?: boolean;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFollow {
  id?: string;
  followerId: string;
  followingId: string;

  createdBy?: string;
  createdAt?: string;
}

export interface IRating {
  id?: string;
  stars: number;
  userId: string;
  bookId: string;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IComment {
  id?: string;
  userId: string;
  bookId: string;
  comment: string;
  ratingComment?: boolean;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDashboard {
  totalUser: number;
  totalBook: number;
  totalReview: number;
}
