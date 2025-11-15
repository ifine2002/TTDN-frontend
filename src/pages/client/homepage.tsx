import { useState, useEffect, useRef } from "react";
import { Spin, Row, Col, Card, Avatar, Empty } from "antd";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import queryString from "query-string";
import { callGetHomeBooks } from "api/services";
import BookList from "components/client/book/BookList";
import { IPagination, IPost } from "@/types/backend";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { fetchFollowing } from "redux/slice/followSlice";
import { Link } from "react-router-dom";

const HomePage = () => {
  const isLoading = useRef(false);
  const dispatch = useAppDispatch();

  // State
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [books, setBooks] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>({
    page: 1,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0,
  });

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );

  // Get following list from Redux
  const followingList = useAppSelector(
    (state) => state.follow.followings.result
  );
  const followingLoading = useAppSelector(
    (state) => state.follow.followings.isFetching
  );

  // Khởi tạo WebSocket
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // Subscribe đến topic cập nhật sách
      client.subscribe("/topic/books", () => {
        try {
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

    client.onDisconnect = () => {
      // no-op
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();

    return () => {
      if (client) client.deactivate();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reset dữ liệu và fetch lại từ đầu
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

  // Hàm lấy dữ liệu sách từ API
  const fetchBooks = async (pageNumber: number) => {
    if (isLoading.current) {
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
      };

      const query = queryString.stringify(params);
      const response = await callGetHomeBooks(query);

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
      console.error("Error fetching books:", error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
      isLoading.current = false;
    }
  };

  // Fetch books lần đầu khi component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    resetAndFetchBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch following list — CHỈ khi đã đăng nhập
  useEffect(() => {
    if (!isAuthenticated) return;
    const query = queryString.stringify({
      page: 0,
      size: 10,
    });
    dispatch(fetchFollowing({ query }));
  }, [dispatch, isAuthenticated]); // chạy lại khi auth thay đổi

  // Xử lý khi người dùng cuộn xuống để tải thêm sách
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

  // Tùy biến grid sizes: nếu chưa đăng nhập, BookList chiếm full width
  const centerColProps = isAuthenticated
    ? { xs: 24, sm: 24, md: 18, lg: 19, xl: 20, xxl: 20 }
    : { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 };

  return (
    <div style={{ backgroundColor: "#faf8f6" }} className="min-h-screen py-6">
      <div className="container mx-auto px-4">
        <Row>
          {/* Center: BookList */}
          <Col {...centerColProps}>
            <Spin spinning={loading} size="large">
              <BookList
                books={books}
                loading={loading}
                pagination={pagination}
                onLoadMore={handleLoadMore}
              />
            </Spin>
          </Col>

          {/* Right: Following list — chỉ render khi đã đăng nhập */}
          {isAuthenticated && (
            <Col xs={0} sm={0} md={6} lg={5} xl={4} xxl={4}>
              <div style={{ position: "fixed", top: 80, right: 20 }}>
                <Card
                  title="Đang theo dõi"
                  bordered={false}
                  style={{
                    backgroundColor: "#faf8f6",
                    boxShadow: "none",
                    borderRadius: "8px",
                    marginLeft: "auto",
                    maxWidth: "280px",
                    fontSize: "13px",
                    padding: "8px",
                  }}
                  headStyle={{ padding: "4px 8px" }}
                  bodyStyle={{
                    padding: "4px",
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
                  }}
                >
                  <Spin spinning={followingLoading} size="small">
                    {followingList && followingList.length > 0 ? (
                      <div className="space-y-3">
                        {followingList.map((user) => (
                          <Link
                            to={`/profile/${user.id}`}
                            className="text-inherit no-underline"
                          >
                            <div
                              key={user.id}
                              className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                            >
                              <Avatar
                                size={36}
                                src={
                                  typeof user.image === "string"
                                    ? user.image
                                    : "http://localhost:9000/book-rating/avatar.jpg"
                                }
                                alt={user.fullName}
                                style={{ flex: "0 0 36px" }}
                              />

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">
                                  {user.fullName}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="Chưa follow ai"
                        style={{ margin: "20px 0" }}
                      />
                    )}
                  </Spin>
                </Card>
              </div>
            </Col>
          )}

          {/* Right: Empty space for balance — chỉ khi đã đăng nhập */}
          {isAuthenticated && (
            <Col xs={0} sm={0} md={2} lg={2} xl={2} xxl={2}></Col>
          )}
        </Row>
      </div>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "30px",
            right: isAuthenticated ? "250px" : "40px",
            // nếu đang hiển thị sidebar thì đẩy nút tránh bị che
            padding: "10px 14px",
            backgroundColor: "#b0a4a0ff",
            color: "white",
            border: "none",
            borderRadius: "50%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 1000,
            fontSize: "15px",
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default HomePage;
