import { Row, Col, Rate, Button, Divider, List, Avatar } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./ListReview.scss";
import { IStars, IReviews } from "@/types/backend";

interface IProps {
  stars?: IStars;
  listReview: IReviews[];
}
const ListReview = (props: IProps) => {
  const { stars, listReview } = props;
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);

  return (
    <div className="list-review">
      <div className="header-list-review">
        <Divider>Điểm xếp hạng và bài đánh giá</Divider>
      </div>
      <div className="rating-statistics">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div className="rating-average">
              <div className="rating-average-number">
                {stars?.averageRating?.toFixed(1)}
              </div>
              <Rate
                disabled
                allowHalf
                value={stars?.averageRating}
                className="rating-average-stars"
              />
              <div className="rating-count-text">
                {stars?.ratingCount} đánh giá
              </div>
            </div>
          </Col>

          <Col xs={24} sm={16} md={18}>
            {[
              { value: 5, count: stars?.totalFiveStar },
              { value: 4, count: stars?.totalFourStar },
              { value: 3, count: stars?.totalThreeStar },
              { value: 2, count: stars?.totalTwoStar },
              { value: 1, count: stars?.totalOneStar },
            ].map((star) => {
              const percentage =
                stars!.ratingCount > 0
                  ? Math.round((star.count! / stars!.ratingCount) * 100)
                  : 0;

              return (
                <Row key={star.value} align="middle" className="star-row">
                  <Col span={4}>
                    <div className="star-label">
                      <span className="star-number">{star.value}</span>
                      <StarOutlined style={{ color: "#faad14" }} />
                    </div>
                  </Col>
                  <Col span={16}>
                    <div className="star-progress-container">
                      <div
                        className="star-progress-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Col>
                  <Col span={4}>
                    <div className="star-percentage">
                      <span>{percentage}%</span>
                      <span className="star-count">({star.count})</span>
                    </div>
                  </Col>
                </Row>
              );
            })}
          </Col>
        </Row>
      </div>

      <div className="review-list-container">
        {listReview && listReview.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              dataSource={showAllReviews ? listReview : listReview.slice(0, 3)}
              renderItem={(review) => (
                <List.Item key={review.commentId} className="review-list-item">
                  <div className="review-item">
                    <div className="user-info">
                      <Avatar
                        src={
                          review.image ||
                          "http://localhost:9000/book-rating/avatar.png"
                        }
                        size={40}
                      />

                      <div className="user-details">
                        <Link
                          to={`/profile/${review.userId}`}
                          className="hover:underline"
                        >
                          <div className="user-name">{review.fullName}</div>
                        </Link>
                        <div className="review-date">
                          {new Date(review.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="review-content">
                      <div className="review-rating">
                        <Rate
                          disabled
                          value={review.stars}
                          className="review-stars"
                        />
                      </div>
                      <div className="review-comment">{review.comment}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />

            {listReview.length > 3 && (
              <div className="view-more-container">
                <Button
                  type="link"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="view-more-button"
                >
                  {showAllReviews ? "Thu gọn" : `Xem thêm đánh giá`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="no-reviews">
            <div className="empty-reviews-message">
              Chưa có đánh giá nào cho cuốn sách này
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListReview;
