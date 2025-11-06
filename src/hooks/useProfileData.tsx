import { useState, useEffect, useRef } from "react";
import { callFetchUserProfile, callGetAllPostOfUser } from "api/services";
import queryString from "query-string";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { IPost, IUser } from "@/types/backend";

/**
 * Custom hook quản lý dữ liệu profile chung
 * @param {string|number} userId - ID của user cần load profile
 * @param {string} userEmail - Email của user (optional, lấy từ userData sau khi fetch)
 */
export const useProfileData = (userId: number) => {
  const [userData, setUserData] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<IPost[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0,
  });
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const isLoading = useRef(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await callFetchUserProfile(userId);
        if (res && res.data) {
          setUserData(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch books function
  const fetchBooks = async (pageNumber: number) => {
    if (isLoading.current || !userData?.email) {
      return Promise.resolve();
    }

    isLoading.current = true;
    setLoading(true);

    try {
      const pageForApi = pageNumber - 1;
      const params = {
        page: pageForApi,
        size: pagination.pageSize,
        sort: "updatedAt,desc",
        userId: userId,
      };

      const query = queryString.stringify(params);
      const response = await callGetAllPostOfUser(userData.email, query);

      if (response && response.data) {
        const { result, totalPages, totalElements } = response.data;

        if (pageNumber === 1) {
          setBooks(result || []);
        } else {
          setBooks((prevBooks) => [...prevBooks, ...(result || [])]);
        }

        setPagination({
          page: pageNumber,
          pageSize: pagination.pageSize,
          totalElements,
          totalPages,
        });
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
      isLoading.current = false;
    }
  };

  // Reset and fetch books
  const resetAndFetchBooks = () => {
    setBooks([]);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      totalElements: 0,
      totalPages: 0,
    }));
    fetchBooks(1);
  };

  // Load more books
  const handleLoadMore = () => {
    if (isLoading.current) return;

    const nextPage = pagination.page + 1;
    if (nextPage <= pagination.totalPages) {
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      fetchBooks(nextPage).then(() => {
        setTimeout(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: "auto",
          });
        }, 100);
      });
    }
  };

  // WebSocket setup
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // Subscribe to book updates
      client.subscribe("/topic/books", (message) => {
        try {
          const notificationData = JSON.parse(message.body);
          if (notificationData.userId === userId) {
            resetAndFetchBooks();
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      // Subscribe to admin book approvals
      client.subscribe("/topic/admin-books", (message) => {
        try {
          const notificationData = JSON.parse(message.body);
          if (notificationData.action === "approve") {
            const approvedBook = notificationData.data;
            if (approvedBook.user?.id?.toString() === userId?.toString()) {
              setBooks((prevBooks) => {
                if (
                  prevBooks.some((book) => book.bookId === approvedBook.bookId)
                ) {
                  return prevBooks;
                }
                return [approvedBook, ...prevBooks];
              });
              setPagination((prev) => ({
                ...prev,
                totalElements: prev.totalElements + 1,
              }));
            }
          }
        } catch (error) {
          console.error("Error parsing admin book WebSocket message:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [userId]);

  // Fetch books when userData is ready
  useEffect(() => {
    if (userId && userData?.email) {
      resetAndFetchBooks();
    }
  }, [userId, userData]);

  return {
    userData,
    setUserData,
    loading,
    books,
    pagination,
    handleLoadMore,
    resetAndFetchBooks,
    stompClient,
  };
};
