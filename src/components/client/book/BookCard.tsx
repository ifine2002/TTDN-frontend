import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Rate,
  Tag,
  Typography,
  Space,
  Avatar,
  Button,
  Tooltip,
  message,
} from "antd";
import { Link } from "react-router-dom";
import {
  BookOutlined,
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import BookDetailModal from "./BookDetailModal";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { callGetBookDetailById } from "api/services";
import { likeBook, unlikeBook, fetchFavorite } from "redux/slice/favoriteSlice";
import { IPost, IStars } from "@/types/backend";

// ====== WebSocket globals (single connection across app) ======
let globalStompClient: Client | null = null;
const activeSubscriptions: Record<
  string,
  { subscription: StompSubscription; count: number }
> = {};
let connectionCount = 0;

// A set of listeners to be run whenever the client connects/reconnects
const onConnectListeners = new Set<(frame: any) => void>();

const initializeGlobalWebSocket = () => {
  if (globalStompClient) {
    return globalStompClient;
  }

  const WS_URL =
    (import.meta as any)?.env?.VITE_WS_URL ?? "http://localhost:8080/ws";
  const socket = new SockJS(WS_URL);

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = (frame) => {
    // fan out to all listeners safely
    onConnectListeners.forEach((fn) => {
      try {
        fn(frame);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("onConnect listener error:", e);
      }
    });
  };

  client.onStompError = (frame) => {
    // eslint-disable-next-line no-console
    console.error(`WebSocket STOMP error: ${frame.headers["message"]}`);
  };

  client.onWebSocketClose = () => {
    // If no active components are using it, allow re-init later
    if (connectionCount === 0) {
      globalStompClient = null;
    }
  };

  client.activate();
  globalStompClient = client;
  return client;
};

const subscribeToTopic = (
  topic: string,
  callback: (message: IMessage) => void
) => {
  if (!globalStompClient || !globalStompClient.connected) {
    // Not connected yet; caller should add an onConnect listener to (re)attach
    return null;
  }

  if (!activeSubscriptions[topic]) {
    const subscription = globalStompClient.subscribe(topic, callback);
    activeSubscriptions[topic] = { subscription, count: 1 };
    return subscription;
  }

  activeSubscriptions[topic].count += 1;
  return activeSubscriptions[topic].subscription;
};

const unsubscribeFromTopic = (topic: string) => {
  const entry = activeSubscriptions[topic];
  if (!entry) return;

  entry.count -= 1;

  if (entry.count <= 0) {
    try {
      entry.subscription.unsubscribe();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Unsubscribe error:", e);
    }
    delete activeSubscriptions[topic];
  }
};

const { Text, Title, Paragraph } = Typography;

interface IProps {
  book: IPost;
}

const BookCard = ({ book: initialBook }: IProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [book, setBook] = useState<IPost>(initialBook);
  const defaultImage = "https://placehold.co/300x400?text=No+Image";

  const user = useAppSelector((state) => state.account.user);
  const favoriteBooks = useAppSelector((state) => state.favorite.favoriteBooks);
  const dispatch = useAppDispatch();

  const isFavorite = useMemo(
    () => favoriteBooks?.includes(book.bookId),
    [favoriteBooks, book.bookId]
  );

  const componentId = React.useRef(
    Math.random().toString(36).substring(2, 8)
  ).current;

  // Track current topic to clean up correctly
  const currentTopicRef = useRef<string | null>(null);
  const onConnectCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!initialBook) {
      console.error("initialBook không tồn tại");
      return;
    }
    // console.debug(`[BookCard ${componentId}] init with`, initialBook);
  }, [initialBook, componentId]);

  useEffect(() => {
    if (!initialBook?.bookId) {
      console.error("initialBook.bookId không tồn tại");
      return;
    }

    let isMounted = true;
    const bookId = String(initialBook.bookId);
    const topic = `/topic/reviews/${bookId}`;

    connectionCount += 1;

    const client = initializeGlobalWebSocket();

    const handleMessage = async (message: IMessage) => {
      if (!isMounted) return;

      if (message.body) {
        try {
          const notification = JSON.parse(message.body);
          const { action } = notification;
          if (
            action === "create" ||
            action === "update" ||
            action === "delete"
          ) {
            await fetchBookDetail();
          }
        } catch (err) {
          console.error(`[BookCard ${componentId}] Lỗi xử lý thông báo:`, err);
        }
      }
    };

    const attach = () => {
      const sub = subscribeToTopic(topic, handleMessage);
      if (sub) {
        currentTopicRef.current = topic; // IMPORTANT for proper cleanup
      }
    };

    if (client.connected) {
      attach();
    } else {
      const listener = () => attach();
      onConnectListeners.add(listener);
      onConnectCleanupRef.current = () => onConnectListeners.delete(listener);
    }

    // Initial sync
    fetchBookDetail();

    return () => {
      isMounted = false;

      // Remove pending onConnect listener if any
      if (onConnectCleanupRef.current) {
        try {
          onConnectCleanupRef.current();
        } finally {
          onConnectCleanupRef.current = null;
        }
      }

      // Unsubscribe topic if subscribed
      if (currentTopicRef.current) {
        unsubscribeFromTopic(currentTopicRef.current);
        currentTopicRef.current = null;
      }

      connectionCount = Math.max(0, connectionCount - 1);
      if (connectionCount === 0 && globalStompClient) {
        globalStompClient.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBook?.bookId, componentId]);

  useEffect(() => {
    if (user && user.id !== 0) {
      dispatch(fetchFavorite({ query: "" }));
    }
  }, [user, dispatch]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = dayjs(dateString);
    return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "";
  };

  const toggleFavorite = async () => {
    try {
      if (!user || user.id == 0) {
        message.warning("Vui lòng đăng nhập để yêu thích sách");
        return;
      }

      if (isFavorite) {
        await dispatch(unlikeBook(book.bookId));
        message.success("Đã bỏ yêu thích sách");
      } else {
        await dispatch(likeBook(book.bookId));
        message.success("Đã thêm vào danh sách yêu thích");
      }

      // refresh server truth
      dispatch(fetchFavorite({ query: "" }));
    } catch (error) {
      console.error("Lỗi khi thao tác với sách yêu thích:", error);
      message.error("Có lỗi xảy ra khi thao tác với sách yêu thích");
    }
  };

  const openBookDetailModal = () => setModalVisible(true);

  const closeBookDetailModal = (updatedStars?: IStars) => {
    setModalVisible(false);
    if (updatedStars) {
      setBook((prev) => ({
        ...prev,
        stars: updatedStars,
      }));
    }
    // ensure full sync
    setTimeout(() => fetchBookDetail(), 500);
  };

  const fetchBookDetail = async () => {
    try {
      if (!initialBook) {
        console.error("initialBook không tồn tại trong fetchBookDetail");
        return;
      }

      if (initialBook.bookId) {
        const response = await callGetBookDetailById(initialBook.bookId);
        if (response?.data) {
          setBook((prev) => ({
            ...prev,
            stars: response?.data?.stars,
          }));
        }
      } else {
        console.error(`[BookCard ${componentId}] Không có bookId`, initialBook);
      }
    } catch (error) {
      console.error(`[BookCard ${componentId}] Lỗi lấy dữ liệu:`, error);
    }
  };

  return (
    <>
      <div className="flex justify-center w-full px-2 sm:px-4">
        <Card
          className="mb-7 shadow-md w-full max-w-full"
          actions={[
            <Tooltip key="rating-tooltip" title="Đánh giá">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={openBookDetailModal}
                className="text-xs sm:text-sm"
              >
                {book.stars?.ratingCount || 0}
              </Button>
            </Tooltip>,
          ]}
        >
          <div className="flex items-center mb-4">
            <Avatar src={book?.user?.image} icon={<UserOutlined />} size={40} />
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <Link
                to={`/profile/${book?.user?.id}`}
                className="hover:underline block truncate"
              >
                <Text strong className="text-sm sm:text-base">
                  {book?.user?.fullName}
                </Text>
              </Link>
              <div>
                <Text type="secondary" className="text-xs">
                  <CalendarOutlined className="mr-1" />
                  {formatDate(book.updatedAt!)}
                </Text>
              </div>
            </div>
          </div>

          <Link to={`/book/${book.bookId}`} className="hover:underline">
            <Title
              level={4}
              className="mb-2 text-base sm:text-lg md:text-xl break-words"
            >
              {book.name}
            </Title>
          </Link>

          <Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: "Xem thêm",
            }}
            className="text-gray-700 mb-4 text-sm sm:text-base"
          >
            {book.description || "Không có mô tả cho sách này."}
          </Paragraph>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-5">
            <div className="flex-shrink-0 flex flex-col items-center md:items-start">
              <img
                alt={book.name}
                src={book.bookImage || defaultImage}
                className="object-cover rounded-lg w-full max-w-[180px] sm:max-w-[200px] md:max-w-[225px] h-auto aspect-[3/4]"
                loading="lazy"
              />
              <div className="book-actions flex flex-col sm:flex-row gap-2 mt-3 w-full sm:w-auto">
                <Button
                  type="primary"
                  size="middle"
                  icon={<ShoppingCartOutlined />}
                  href={book.bookSaleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  Tìm mua
                </Button>
                <Button
                  size="middle"
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={toggleFavorite}
                  className={`w-full sm:w-auto ${
                    isFavorite ? "favorite-button active" : "favorite-button"
                  }`}
                >
                  Yêu thích
                </Button>
              </div>
            </div>

            <Space
              direction="vertical"
              size="small"
              className="w-full flex-1 min-w-0"
            >
              <div className="space-y-2 sm:space-y-3">
                <Text
                  type="secondary"
                  className="flex items-center text-xs sm:text-sm break-words"
                >
                  <UserOutlined className="mr-1 flex-shrink-0" /> Tác giả:{" "}
                  {book.author}
                </Text>

                <Text
                  type="secondary"
                  className="flex items-center text-xs sm:text-sm break-words"
                >
                  <BookOutlined className="mr-1 flex-shrink-0" /> {book.bookFormat}
                </Text>

                <Text className="flex items-center text-xs sm:text-sm break-words">
                  Ngôn ngữ: {book.language}
                </Text>

                <Text className="flex items-center text-xs sm:text-sm break-words">
                  Ngày xuất bản: {book.publishedDate}
                </Text>
              </div>

              {book.categories && book.categories.length > 0 && (
                <div className="mt-3">
                  <Text className="mr-2 text-xs sm:text-sm">Thể loại:</Text>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.categories.map((category) => (
                      <Tag key={category.id} color="blue" className="mb-1 text-xs">
                        {category.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {book.stars && (
                <div
                  className="flex flex-wrap items-center mt-2 cursor-pointer gap-1"
                  onClick={openBookDetailModal}
                >
                  <Text className="mr-2 text-xs sm:text-sm whitespace-nowrap">
                    Đánh giá:
                  </Text>
                  <Rate
                    allowHalf
                    disabled
                    value={book.stars.averageRating || 0}
                    className="text-xs sm:text-sm"
                  />
                  <Text className="ml-2 text-xs sm:text-sm whitespace-nowrap">
                    ({book.stars?.ratingCount || 0})
                  </Text>
                </div>
              )}
            </Space>
          </div>
        </Card>
      </div>

      <BookDetailModal
        visible={modalVisible}
        bookId={book.bookId}
        onCancel={closeBookDetailModal}
        userId={user.id}
      />
    </>
  );
};

export default BookCard;
