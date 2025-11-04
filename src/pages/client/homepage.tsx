import { useState, useEffect, useRef } from "react";
import { Spin } from "antd";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import queryString from "query-string";
import { callGetHomeBooks } from "api/services";
import BookList from "components/client/book/BookList";
import { IPagination, IPost } from "@/types/backend";

const HomePage = () => {
  const isLoading = useRef(false);

  // State
  const [books, setBooks] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>({
    page: 1,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0,
  });

  // Khởi tạo WebSocket
  useEffect(() => {
    // Tạo WebSocket connection
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      // debug: function (str) {
      //   // console.log(str);
      // },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Khi kết nối thành công
    client.onConnect = () => {
      // console.log('Connected to WebSocket');

      // Subscribe đến topic cập nhật sách
      client.subscribe("/topic/books", () => {
        try {
          // const notificationData = JSON.parse(message.body);
          // console.log('WebSocket notification received:', notificationData);

          // Cập nhật lại dữ liệu khi có sự thay đổi
          resetAndFetchBooks();
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      // Subscribe đến topic duyệt sách từ trang admin approval
      client.subscribe("/topic/admin-books", (message) => {
        try {
          const notificationData = JSON.parse(message.body);
          if (notificationData.action === "approve") {
            const approvedBook = notificationData.data;
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
        } catch (error) {
          console.error("Error parsing admin book WebSocket message:", error);
        }
      });
    };

    // Khi mất kết nối
    client.onDisconnect = () => {
      // console.log('Disconnected from WebSocket');
    };

    // Khi có lỗi
    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    // Kết nối
    client.activate();

    // Cleanup khi unmount
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // Fetch books lần đầu khi component mount
  useEffect(() => {
    resetAndFetchBooks();
  }, []);

  // Reset dữ liệu và fetch lại từ đầu
  const resetAndFetchBooks = () => {
    setBooks([]);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      totalElements: 0,
      totalPages: 0,
    }));

    fetchBooks(1); // Trang 1
  };

  // Hàm lấy dữ liệu sách từ API
  const fetchBooks = async (pageNumber: number) => {
    // Ngăn ngừa fetch trùng lặp
    if (isLoading.current) {
      return Promise.resolve();
    }

    isLoading.current = true;
    setLoading(true);

    try {
      // API sử dụng 0-based index
      const pageForApi = pageNumber - 1;

      // Tạo query string chỉ với page, size và sort
      const params = {
        page: pageForApi,
        size: pagination.pageSize,
        sort: "updatedAt,desc", // Mặc định sắp xếp theo ngày tạo, mới nhất trước
      };

      // Gọi API
      const query = queryString.stringify(params);
      const response = await callGetHomeBooks(query);

      if (response && response.data) {
        const { result, totalPages, totalElements } = response.data;

        // Nếu đây là lần fetch đầu tiên hoặc page là 1, thay thế books
        if (pageNumber === 1) {
          setBooks(result || []);
        } else {
          // Nếu không, thêm vào danh sách hiện tại
          setBooks((prevBooks) => [...prevBooks, ...(result || [])]);
        }

        // Cập nhật pagination
        setPagination({
          page: pageNumber,
          pageSize: pagination.pageSize,
          totalElements,
          totalPages,
        });
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching books:", error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
      isLoading.current = false;
    }
  };

  // Xử lý khi người dùng cuộn xuống để tải thêm sách
  const handleLoadMore = () => {
    if (isLoading.current) {
      return;
    }

    const nextPage = pagination.page + 1;

    if (nextPage <= pagination.totalPages) {
      // Lưu lại vị trí scroll hiện tại
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      fetchBooks(nextPage).then(() => {
        // Khôi phục lại vị trí scroll sau khi hoàn thành
        setTimeout(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: "auto",
          });
        }, 100);
      });
    } else {
      // console.log('No more pages to load');
    }
  };

  // Nếu chưa đăng nhập, component sẽ không render vì đã bị ProtectedRoute chặn
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="container mx-auto px-4">
        <Spin spinning={loading} size="large">
          <BookList
            books={books}
            loading={loading}
            pagination={pagination}
            onLoadMore={handleLoadMore}
          />
        </Spin>
      </div>
    </div>
  );
};

export default HomePage;
