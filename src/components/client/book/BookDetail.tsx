import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Rate,
  Button,
  Divider,
  message,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { callGetBookDetailById } from "api/services";
import { useParams } from "react-router-dom";
import "styles/book.detail.scss";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import ActionReview from "components/client/review/ActionReview";
import ListReview from "components/client/review/ListReview";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { likeBook, unlikeBook, fetchFavorite } from "redux/slice/favoriteSlice";
import { IBook, IReviews, IStars } from "types/backend";

const { Title, Text, Paragraph } = Typography;

const BookDetail = () => {
  const [book, setBook] = useState<IBook>();
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();

  const user = useAppSelector((state) => state.account.user);
  const dispatch = useAppDispatch();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [listReview, setListReview] = useState<IReviews[]>([]);
  const [userReview, setUserReview] = useState<IReviews | null>(null);
  const [stars, setStart] = useState<IStars>();

  const favoriteBooks = useAppSelector((state) => state.favorite.favoriteBooks);

  const fetchBookDetail = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const response = await callGetBookDetailById(id!);
        if (response?.data) {
          setBook(response.data);
          if (response.data.reviews) setListReview(response.data.reviews);
          if (response.data.stars) setStart(response.data.stars);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      fetchBookDetail();
    }
  }, [id, fetchBookDetail]);

  useEffect(() => {
    if (user && user.id !== 0) {
      dispatch(fetchFavorite({ query: "" }));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user?.id && listReview?.length > 0) {
      const existingReview = listReview.find(
        (review) => review.userId === user.id
      );
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.stars || 0);
        setComment(existingReview.comment || "");
      } else {
        setUserReview(null);
        setRating(0);
        setComment("");
      }
    }
  }, [user?.id, listReview]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function () {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/reviews/${id}`, (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          console.log("BookDetail nhận thông báo WebSocket:", notification);

          const { action, data } = notification;

          switch (action) {
            case "create":
            case "update":
              handleReviewCreateOrUpdate(data);
              break;
            case "delete":
              handleReviewDelete(data);
              break;
            default:
              console.warn("Không xác định được action:", action);
          }

          fetchBookDetail(false);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [id, user?.id, fetchBookDetail]);

  const handleReviewCreateOrUpdate = (reviewData: IReviews) => {
    console.log("Xử lý cập nhật review:", reviewData);

    setListReview((prevReviews) => {
      const existingReviewIndex = prevReviews.findIndex(
        (r) => r.userId === reviewData.userId
      );

      if (existingReviewIndex !== -1) {
        const updatedReviews = [...prevReviews];
        updatedReviews[existingReviewIndex] = {
          ...updatedReviews[existingReviewIndex],
          stars: reviewData.stars,
          comment: reviewData.comment,
          updatedAt: reviewData.updatedAt,
        };
        return updatedReviews;
      } else {
        return [reviewData, ...prevReviews];
      }
    });

    if (user?.id && reviewData.userId === user.id) {
      setUserReview(reviewData);
      setRating(reviewData.stars || 0);
      setComment(reviewData.comment || "");
    }
  };

  const handleReviewDelete = (userId: number) => {
    console.log("Xử lý xóa review của user:", userId);

    setListReview((prevReviews) =>
      prevReviews.filter((review) => review.userId !== userId)
    );

    if (user?.id && user.id === userId) {
      setUserReview(null);
      setRating(0);
      setComment("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!book) {
    return <div>Không tìm thấy sách</div>;
  }
  const isFavorite = favoriteBooks.includes(book.id!);

  const toggleFavorite = async () => {
    try {
      if (!user || user.id === 0) {
        message.warning("Vui lòng đăng nhập để yêu thích sách");
        return;
      }

      if (isFavorite) {
        // Nếu đã yêu thích thì gọi API hủy yêu thích
        await dispatch(unlikeBook(book.id!));
        message.success("Đã bỏ yêu thích sách");
      } else {
        // Nếu chưa yêu thích thì gọi API yêu thích
        await dispatch(likeBook(book.id!));
        message.success("Đã thêm vào danh sách yêu thích");
      }

      // Sau khi thao tác thành công, cập nhật lại danh sách sách yêu thích
      dispatch(fetchFavorite({ query: "" }));
    } catch (error) {
      console.error("Lỗi khi thao tác với sách yêu thích:", error);
      message.error("Có lỗi xảy ra khi thao tác với sách yêu thích");
    }
  };

  return (
    <div className="book-detail-container">
      <div className="book-image-container">
        <img
          src={book.image?.toString()}
          alt={book.name}
          className="book-image"
        />
        <div className="book-actions">
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            href={book.bookSaleLink}
            target="_blank"
          >
            Tìm mua
          </Button>
          <Button
            size="large"
            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
            onClick={toggleFavorite}
            className={
              isFavorite ? "favorite-button active" : "favorite-button"
            }
          >
            Yêu thích
          </Button>
        </div>
      </div>

      <div className="content-container">
        <div className="book-info">
          <div className="book-header">
            <Title level={2}>{book.name}</Title>
            <div className="book-author">
              <Text>Tác giả: {book.author}</Text>
            </div>
          </div>

          <div className="book-rating">
            <Rate allowHalf disabled value={stars?.averageRating} />
            <Text className="rating-count">
              {stars?.averageRating.toFixed(1)}
            </Text>
            <Text className="reviews-count">
              ({stars?.ratingCount} đánh giá)
            </Text>
          </div>

          <Paragraph className="book-description">{book.description}</Paragraph>
          <div className="book-categories">
            <Text>
              <span style={{ fontWeight: "bold" }}>Thể loại:</span>{" "}
              {book.categories?.map((cat) => cat.name).join(", ")}
            </Text>
          </div>

          <div className="book-details">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Định dạng</Text>
                <div>{book.bookFormat}</div>
              </Col>
              <Col span={8}>
                <Text strong>Ngôn ngữ</Text>
                <div>{book.language}</div>
              </Col>
              <Col span={8}>
                <Text strong>Ngày xuất bản</Text>
                <div>{book.publishedDate.toString()}</div>
              </Col>
            </Row>
          </div>

          <Divider />
          <ActionReview
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            userReview={userReview}
          />
          <ListReview stars={stars} listReview={listReview} />
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
