import { useState, useRef } from "react";
import { callFetchAllBookFavoriteOfUser } from "api/services";
import queryString from "query-string";
import { IBookSearch } from "@/types/backend";

export const useFavoriteBooks = (userId?: number) => {
  const [favoriteBooks, setFavoriteBooks] = useState<IBookSearch[]>([]);
  const [favoritePagination, setFavoritePagination] = useState({
    page: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [favoriteLoaded, setFavoriteLoaded] = useState(false);
  const isFavoriteLoading = useRef(false);

  const fetchFavoriteBooks = async (pageNumber: number, pageSize = 5) => {
    if (isFavoriteLoading.current || !userId) {
      return Promise.resolve();
    }

    isFavoriteLoading.current = true;
    setLoadingFavorite(true);

    try {
      const pageForApi = pageNumber - 1;
      const params = {
        page: pageForApi,
        size: pageSize,
        userId: userId,
      };
      const query = queryString.stringify(params);
      const response = await callFetchAllBookFavoriteOfUser(userId, query);

      if (response && response.data) {
        const { result, totalPages, totalElements } = response.data;
        setFavoriteBooks(result || []);
        setFavoritePagination({
          page: pageNumber,
          pageSize: pageSize,
          totalElements,
          totalPages,
        });
        setFavoriteLoaded(true);
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching favorite books:", error);
      return Promise.reject(error);
    } finally {
      setLoadingFavorite(false);
      isFavoriteLoading.current = false;
    }
  };

  const resetAndFetchFavoriteBooks = () => {
    setFavoriteBooks([]);
    setFavoritePagination((prev) => ({
      ...prev,
      page: 1,
      totalElements: 0,
      totalPages: 0,
    }));
    fetchFavoriteBooks(1, 5);
  };

  const handleLoadMoreFavorite = () => {
    if (isFavoriteLoading.current) return;
    const nextPage = favoritePagination.page + 1;
    if (nextPage <= favoritePagination.totalPages) {
      fetchFavoriteBooks(nextPage, favoritePagination.pageSize);
    }
  };

  const handleFavoritePageChange = (page: number, pageSize: number) => {
    fetchFavoriteBooks(page, pageSize);
  };

  return {
    favoriteBooks,
    favoritePagination,
    loadingFavorite,
    favoriteLoaded,
    fetchFavoriteBooks,
    resetAndFetchFavoriteBooks,
    handleLoadMoreFavorite,
    handleFavoritePageChange,
  };
};
