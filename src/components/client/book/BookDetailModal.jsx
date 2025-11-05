import React, { useState, useEffect, useCallback } from "react";
import { Modal, Typography, Rate, Divider, Row, Col, Avatar, Spin } from "antd";
import { callGetBookDetailById } from "../../../api/services";
import ActionReview from "../review/ActionReview";
import ListReview from "../review/ListReview";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import "styles/book.detail.modal.scss";

const { Title, Text, Paragraph } = Typography;

// Hàm tính chiều rộng của scrollbar
const getScrollbarWidth = () => {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);
  const inner = document.createElement("div");
  outer.appendChild(inner);
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  return scrollbarWidth;
};

const BookDetailModal = ({ visible, bookId, onCancel, user }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [listReview, setListReview] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [stars, setStars] = useState(null);
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  const fetchBookDetail = useCallback(
    async (showLoading = true) => {
      if (!bookId) return;

      try {
        if (showLoading) setLoading(true);
        const response = await callGetBookDetailById(bookId);
        setBook(response.data);
        setListReview(response.data.reviews);
        if (showLoading) setLoading(false);
        setStars(response.data.stars);
        setIsDataUpdated(true);
      } catch (error) {
        console.error("Error fetching book details:", error);
        if (showLoading) setLoading(false);
      }
    },
    [bookId]
  );

  useEffect(() => {
    if (visible && bookId) {
      fetchBookDetail();
    }
  }, [visible, bookId, fetchBookDetail]);

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
  }, [user, listReview]);

  useEffect(() => {
    if (!visible || !bookId) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log(`BookDetailModal: Đã kết nối WebSocket cho book ${bookId}`);

      client.subscribe(`/topic/reviews/${bookId}`, (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          console.log(
            "BookDetailModal nhận thông báo WebSocket:",
            notification
          );

          const { action, data, timestamp } = notification;

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
        console.log(
          `BookDetailModal: Đã ngắt kết nối WebSocket cho book ${bookId}`
        );
      }
    };
  }, [visible, bookId, user?.id]);

  const handleReviewCreateOrUpdate = (reviewData) => {
    console.log("BookDetailModal: Xử lý cập nhật review:", reviewData);

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
        // Cập nhật stars object khi tạo mới review
        setStars((prevStars) => ({
          ...prevStars,
          ratingCount: prevStars.ratingCount + 1,
        }));
        return [reviewData, ...prevReviews];
      }
    });

    if (reviewData.userId === user?.id) {
      setUserReview(reviewData);
      setRating(reviewData.stars || 0);
      setComment(reviewData.comment || "");
    }
  };

  const handleReviewDelete = (userId) => {
    console.log("BookDetailModal: Xử lý xóa review của user:", userId);

    setListReview((prevReviews) =>
      prevReviews.filter((review) => review.userId !== userId)
    );

    // Cập nhật stars object
    setStars((prevStars) => ({
      ...prevStars,
      ratingCount: Math.max(0, prevStars.ratingCount - 1),
    }));

    if (user?.id === userId) {
      setUserReview(null);
      setRating(0);
      setComment("");
    }
  };

  useEffect(() => {
    if (visible) {
      // Lấy giá trị ban đầu
      const originalBodyPaddingRight = window.getComputedStyle(
        document.body
      ).paddingRight;
      const originalBodyOverflow = window.getComputedStyle(
        document.body
      ).overflow;
      const scrollbarWidth = getScrollbarWidth();
      const bodyPaddingRightValue = parseInt(originalBodyPaddingRight, 10) || 0;

      // Thêm padding cho body
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${
        bodyPaddingRightValue + scrollbarWidth
      }px`;

      // Thêm padding cho header
      const header = document.querySelector(".header-section");
      let originalHeaderPaddingRight = "0px";

      if (header) {
        originalHeaderPaddingRight =
          window.getComputedStyle(header).paddingRight;
        const currentHeaderPadding =
          parseInt(originalHeaderPaddingRight, 10) || 0;
        header.style.paddingRight = `${
          currentHeaderPadding + scrollbarWidth
        }px`;
      }

      // Hàm cleanup
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;

        if (header) {
          header.style.paddingRight = originalHeaderPaddingRight;
        }
      };
    }
  }, [visible]);

  // Xử lý khi đóng modal
  const handleClose = () => {
    // Nếu dữ liệu đã được cập nhật, gọi onCancel để cập nhật phía BookCard
    if (isDataUpdated) {
      onCancel(stars);
    } else {
      onCancel();
    }
    // Reset lại trạng thái đã cập nhật
    setIsDataUpdated(false);
  };

  return (
    <Modal
      title={book?.name || "Chi tiết sách"}
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
      centered
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px 24px",
        },
        content: {
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 100px)",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.65)",
        },
      }}
      getContainer={false}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="Đang tải..." />
        </div>
      ) : !book ? (
        <div className="error-container">Không tìm thấy thông tin sách</div>
      ) : (
        <div className="book-modal-content">
          <div className="book-header">
            <div className="book-image-container">
              <img
                src={book.image}
                alt={book.name}
                className="book-modal-image"
              />
            </div>
            <div className="book-info">
              <Title level={3}>{book.name}</Title>
              <div className="book-author">
                <Text>Tác giả: {book.author}</Text>
              </div>

              <div className="book-rating">
                <Rate allowHalf disabled value={stars?.averageRating || 0} />
                <Text className="rating-count">
                  {stars?.averageRating?.toFixed(1) || 0}
                </Text>
                <Text className="reviews-count">
                  ({stars?.ratingCount || 0} đánh giá)
                </Text>
              </div>

              <Paragraph
                className="book-description"
                ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
              >
                {book.description}
              </Paragraph>
            </div>
          </div>

          <Divider />

          <div className="book-additional-info">
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
                <div>{book.publishedDate}</div>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "8px" }}>
              <Col span={24}>
                <Text strong>Thể loại:</Text>
                <div>{book.categories?.map((cat) => cat.name).join(", ")}</div>
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
            bookIdModal={bookId}
          />

          <ListReview stars={stars} listReview={listReview} />
        </div>
      )}
    </Modal>
  );
};

export default BookDetailModal;
