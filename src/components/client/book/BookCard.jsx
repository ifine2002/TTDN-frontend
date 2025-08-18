import React, { useState, useEffect } from 'react';
import { Card, Rate, Tag, Typography, Space, Avatar, Button, Tooltip, message } from 'antd';
import { Link } from 'react-router-dom';
import {
  BookOutlined,
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  HeartFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BookDetailModal from './BookDetailModal';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { callGetBookDetailById } from '../../../api/services';
import { likeBook, unlikeBook, fetchFavorite } from '../../../redux/slice/favoriteSlice';

// Tạo một WebSocket client toàn cục duy nhất
let globalStompClient = null;
let activeSubscriptions = {};
let connectionCount = 0;

// Hàm khởi tạo kết nối WebSocket toàn cục
const initializeGlobalWebSocket = () => {
  if (globalStompClient) {
    return globalStompClient;
  }

  // console.log('Khởi tạo kết nối WebSocket toàn cục');
  const socket = new SockJS('http://localhost:8080/ws');
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    // console.log('WebSocket kết nối toàn cục thành công');
  };

  client.onStompError = (frame) => {
    console.error(`WebSocket error toàn cục: ${frame.headers['message']}`);
  };

  client.onWebSocketClose = () => {
    // console.log('WebSocket đóng kết nối toàn cục');
    if (connectionCount === 0) {
      globalStompClient = null;
    }
  };

  client.activate();
  globalStompClient = client;
  return client;
};

// Hàm đăng ký theo dõi một chủ đề
const subscribeToTopic = (topic, callback) => {
  if (!globalStompClient || !globalStompClient.connected) {
    console.error('Không thể đăng ký: WebSocket chưa kết nối');
    return null;
  }

  if (!activeSubscriptions[topic]) {
    // console.log(`Đăng ký lắng nghe chủ đề: ${topic}`);
    const subscription = globalStompClient.subscribe(topic, callback);
    activeSubscriptions[topic] = {
      subscription,
      count: 1
    };
    return subscription;
  } else {
    // console.log(`Tăng số lượng đăng ký cho chủ đề: ${topic}`);
    activeSubscriptions[topic].count += 1;
    return activeSubscriptions[topic].subscription;
  }
};

// Hàm hủy đăng ký theo dõi một chủ đề
const unsubscribeFromTopic = (topic) => {
  if (activeSubscriptions[topic]) {
    activeSubscriptions[topic].count -= 1;
    // console.log(`Giảm số lượng đăng ký cho chủ đề: ${topic}, còn lại: ${activeSubscriptions[topic].count}`);

    if (activeSubscriptions[topic].count === 0) {
      // console.log(`Hủy đăng ký chủ đề: ${topic}`);
      activeSubscriptions[topic].subscription.unsubscribe();
      delete activeSubscriptions[topic];
    }
  }
};

const { Meta } = Card;
const { Text, Title, Paragraph } = Typography;

const BookCard = ({ book: initialBook }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [book, setBook] = useState(initialBook);
  const defaultImage = 'https://placehold.co/300x400?text=No+Image';
  const user = useAppSelector(state => state.account.user);

  const dispatch = useAppDispatch();
  const favoriteBooks = useAppSelector(state => state.favorite.favoriteBooks);
  const isFavorite = favoriteBooks.includes(book.bookId);
  const componentId = React.useRef(Math.random().toString(36).substring(2, 8)).current;
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!initialBook) {
      console.error('initialBook không tồn tại');
      return;
    }
    // console.log(`[BookCard ${componentId}] Khởi tạo với:`, initialBook);
  }, [initialBook, componentId]);

  useEffect(() => {
    if (!initialBook || !initialBook.bookId) {
      console.error('initialBook.bookId không tồn tại');
      return;
    }

    // Flag để kiểm tra nếu component vẫn mounted
    let isComponentMounted = true;
    const bookId = initialBook.bookId.toString();
    const topic = `/topic/reviews/${bookId}`;

    // console.log(`[BookCard ${componentId}] Thiết lập theo dõi cho book ${bookId}`);

    // Tăng số lượng kết nối
    connectionCount++;

    // Đảm bảo kết nối WebSocket toàn cục đã được khởi tạo
    const client = initializeGlobalWebSocket();

    // Hàm xử lý tin nhắn
    const handleMessage = async (message) => {
      if (!isComponentMounted) return;

      if (message.body) {
        try {
          const notification = JSON.parse(message.body);
          const { action, data } = notification;
          // console.log(`[BookCard ${componentId}] Nhận thông báo WebSocket: ${action}`, data);

          if (action === "create" || action === "update" || action === "delete") {
            // console.log(`[BookCard ${componentId}] Cập nhật dữ liệu sau thông báo ${action}`);
            await fetchBookDetail();
          }
        } catch (err) {
          console.error(`[BookCard ${componentId}] Lỗi xử lý thông báo:`, err);
        }
      }
    };

    // Đăng ký theo dõi chủ đề khi client đã kết nối
    const setupSubscription = () => {
      if (client.connected) {
        const sub = subscribeToTopic(topic, handleMessage);
        setSubscription(sub);
      } else {
        client.onConnect = () => {
          // console.log(`[BookCard ${componentId}] WebSocket kết nối thành công, đăng ký chủ đề`);
          const sub = subscribeToTopic(topic, handleMessage);
          setSubscription(sub);
        };
      }
    };

    setupSubscription();

    // Cập nhật dữ liệu ban đầu để đảm bảo dữ liệu đồng bộ
    fetchBookDetail();

    // Cleanup
    return () => {
      // console.log(`[BookCard ${componentId}] Cleanup - Component unmount cho book ${bookId}`);
      isComponentMounted = false;

      // Hủy đăng ký chủ đề
      unsubscribeFromTopic(topic);

      // Giảm số lượng kết nối
      connectionCount--;

      // Nếu không còn kết nối nào, đóng WebSocket
      if (connectionCount === 0 && globalStompClient) {
        // console.log('Đóng kết nối WebSocket toàn cục vì không còn component nào sử dụng');
        globalStompClient.deactivate();
      }
    };
  }, [initialBook?.bookId, componentId, dispatch]);

  useEffect(() => {
    if (user && user.id !== "") {
      dispatch(fetchFavorite({ query: '' }));
    }
  }, [user, dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const toggleFavorite = async () => {
    try {
      if (!user || user.id == '') {
        message.warning('Vui lòng đăng nhập để yêu thích sách');
        return;
      }

      if (isFavorite) {
        // Nếu đã yêu thích thì gọi API hủy yêu thích
        await dispatch(unlikeBook(book.bookId));
        message.success('Đã bỏ yêu thích sách');
      } else {
        // Nếu chưa yêu thích thì gọi API yêu thích
        await dispatch(likeBook(book.bookId));
        message.success('Đã thêm vào danh sách yêu thích');
      }

      // Sau khi thao tác thành công, cập nhật lại danh sách sách yêu thích
      dispatch(fetchFavorite({ query: '' }));
    } catch (error) {
      console.error('Lỗi khi thao tác với sách yêu thích:', error);
      message.error('Có lỗi xảy ra khi thao tác với sách yêu thích');
    }
  };

  const openBookDetailModal = () => {
    setModalVisible(true);
  };

  const closeBookDetailModal = (updatedStars) => {
    setModalVisible(false);
    if (updatedStars) {
      setBook(prevBook => ({
        ...prevBook,
        stars: updatedStars
      }));
      // Cập nhật ngay lập tức thay vì chờ WebSocket
      // console.log(`[BookCard ${componentId}] Cập nhật stars từ modal:`, updatedStars);
    }
    // Luôn gọi fetchBookDetail() để cập nhật mọi thay đổi
    setTimeout(() => fetchBookDetail(), 500);
  };

  const fetchBookDetail = async () => {
    try {
      // Kiểm tra nếu không có initialBook
      if (!initialBook) {
        console.error('initialBook không tồn tại trong fetchBookDetail');
        return;
      }

      // console.log(`[BookCard ${componentId}] Đang lấy dữ liệu chi tiết sách`, initialBook.bookId);

      // Luôn sử dụng API detail-book với bookId, bất kể có id hay không
      if (initialBook.bookId) {
        const response = await callGetBookDetailById(initialBook.bookId);
        // console.log(`[BookCard ${componentId}] Nhận dữ liệu từ API:`, response.data);

        if (response.data) {
          setBook(prevBook => ({
            ...prevBook,
            stars: response.data.stars
          }));
          // console.log(`[BookCard ${componentId}] Cập nhật stars:`, response.data.stars);
        }
      } else {
        console.error(`[BookCard ${componentId}] Không có ID sách (bookId):`, initialBook);
      }
    } catch (error) {
      console.error(`[BookCard ${componentId}] Lỗi lấy dữ liệu:`, error);
    }
  };



  return (
    <>
      <div className="flex justify-center w-full">
        <Card
          className="mb-7 shadow-md"
          actions={[
            <Tooltip key="rating-tooltip" title="Đánh giá">
              <Button type="text" icon={<MessageOutlined />} onClick={openBookDetailModal}>
                {book.stars?.ratingCount || 0}
              </Button>
            </Tooltip>,
          ]}
        >
          <div className="flex items-center mb-4">
            <Avatar
              src={book.user.image}
              icon={<UserOutlined />}
              size={40}
            />
            <div className="ml-3">
              <Link to={`/profile/${book.user.id}`} className="hover:underline">
                <Text strong>{book.user.fullName}</Text>
              </Link>
              <div>
                <Text type="secondary" className="text-xs">
                  <CalendarOutlined className="mr-1" />
                  {formatDate(book.updatedAt)}
                </Text>
              </div>
            </div>
          </div>

          <Link to={`/book/${book.bookId}`} className="hover:underline">
            <Title level={4} className="mb-2">
              {book.name}
            </Title>
          </Link>

          <Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: 'Xem thêm',
            }}
            className="text-gray-700 mb-4"
          >
            {book.description || 'Không có mô tả cho sách này.'}
          </Paragraph>

          <div className="flex gap-4 mt-5">
            <div>
              <img
                alt={book.name}
                src={book.bookImage || defaultImage}
                className="object-cover rounded-lg"
                style={{ height: '300px', width: '225px' }}
              />
              <div className="book-actions flex gap-2 mt-2">
                <Button
                  type="primary"
                  size="middle"
                  icon={<ShoppingCartOutlined />}
                  href={book.bookSaleLink}
                  target="_blank"
                >
                  Tìm mua
                </Button>
                <Button
                  size="middle"
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={toggleFavorite}
                  className={isFavorite ? 'favorite-button active' : 'favorite-button'}
                >
                  Yêu thích
                </Button>
              </div>
            </div>

            <Space direction="vertical" size="small" className="w-full">
              <div className="">
                <Text type="secondary" className="flex items-center">
                  <UserOutlined className="mr-1" /> Tác giả: {book.author}
                </Text>

                <Text type="secondary" className="flex items-center mt-4">
                  <BookOutlined className="mr-1" /> {book.bookFormat}
                </Text>

                <Text className="flex items-center mt-4">
                  Ngôn ngữ: {book.language}
                </Text>

                <Text className="flex items-center mt-4">
                  Ngày xuất bản: {book.publishedDate}
                </Text>
              </div>

              {book.categories && book.categories.length > 0 && (
                <div className="mt-3">
                  <Text className="mr-2">Thể loại:</Text>
                  {book.categories.map((category, index) => (
                    <Tag
                      key={`${category.categoryId || category.id || 'cat'}-${index}-${book.bookId}`}
                      color="blue"
                      className="mb-1"
                    >
                      {category.name}
                    </Tag>
                  ))}
                </div>
              )}

              {book.stars && (
                <div className="flex items-center mt-2 cursor-pointer" onClick={openBookDetailModal}>
                  <Text className="mr-2">Đánh giá:</Text>
                  <Rate allowHalf disabled value={book.stars.averageRating || 0} className="text-sm" />
                  <Text className="ml-2">
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
        user={user}
      />
    </>
  );
};

export default BookCard; 