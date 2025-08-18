import { Rate, Button, Dropdown, Typography, Input, Popconfirm, message } from 'antd';
import { StarOutlined, MoreOutlined } from '@ant-design/icons';
import "./ActionReview.scss"
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { callCreateReview, callDeleteReview, callUpdateReview } from '../../../api/services';
import { useAppSelector } from '../../../redux/hooks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ActionReview = (props) => {
    const { rating, setRating, comment, setComment, userReview, bookIdModal } = props;
    const { id: routeBookId } = useParams();
    const bookId = bookIdModal || routeBookId;
    const [stompClient, setStompClient] = useState(null);
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        // Khởi tạo kết nối WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // Đăng ký nhận thông báo từ topic reviews
            client.subscribe(`/topic/reviews/${bookId}`, (message) => {
                if (message.body) {
                    const notification = JSON.parse(message.body);
                    console.log("Nhận được thông báo WebSocket:", notification);
                    // Không cần xử lý ở đây vì BookDetail đã xử lý và cập nhật state
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        setStompClient(client);

        // Cleanup khi component unmount
        return () => {
            if (client && client.connected) {
                client.deactivate();
            }
        };
    }, [bookId]);

    const handleSubmitReview = async () => {
        try {
            if (userReview) {
                const reviewData = {
                    stars: rating,
                    comment: comment,
                };

                await callUpdateReview(userReview.commentId, userReview.ratingId, reviewData);
                message.success('Đã cập nhật đánh giá thành công');
            }
            else {
                if (!user || user.id === '') {
                    message.error('Vui lòng đăng nhập để gửi đánh giá');
                    return;
                }

                if (!rating) {
                    message.error('Vui lòng chọn số sao đánh giá');
                    return;
                }

                const reviewData = {
                    stars: rating,
                    comment: comment,
                };

                await callCreateReview(reviewData, bookId);
                message.success('Đã gửi đánh giá thành công');
            }

            // Backend sẽ gửi dữ liệu qua WebSocket nên không cần thực hiện thêm hành động ở đây
            // UI sẽ được cập nhật tự động qua subscription WebSocket đã thiết lập
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            message.error('Có lỗi xảy ra khi gửi đánh giá');
        }
    }

    const handleDeleteReview = async () => {
        try {
            if (!userReview) {
                message.error('Không tìm thấy đánh giá để xóa');
                return;
            }

            // Lấy ID của rating và comment (nếu có) từ userReview
            const ratingId = userReview.ratingId;
            const commentId = userReview.commentId;

            await callDeleteReview(commentId, ratingId);
            message.success('Đã xóa đánh giá thành công');

            // Đặt lại state
            setRating(0);
            setComment('');

            // Backend sẽ gửi thông báo qua WebSocket để cập nhật UI
        } catch (error) {
            console.error("Lỗi khi xóa đánh giá:", error);
            message.error('Có lỗi xảy ra khi xóa đánh giá');
        }
    }

    const items = [
        {
            key: '1',
            label: (
                <Popconfirm
                    placement="bottomLeft"
                    title="Xác nhận xóa đánh giá"
                    description="Bạn có chắc chắn muốn xóa đánh giá này?"
                    onConfirm={handleDeleteReview}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <span style={{ color: '#ff4d4f' }}>Xóa</span>
                </Popconfirm>
            ),
        },
    ];
    return (
        <div className="book-review">
            <div className="review-header">
                <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <h3>Chia sẻ suy nghĩ của bạn về cuốn sách này</h3>
            </div>
            <div className="review-form">
                <div className="comment-input">
                    <TextArea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Mô tả đánh giá của bạn (không bắt buộc)"
                        rows={4}
                    />
                </div>
                <div className="rating-input">
                    <Rate
                        value={rating}
                        onChange={setRating}
                    />
                </div>

                <Button
                    type="primary"
                    onClick={handleSubmitReview}
                    size="large"
                >
                    {userReview ? 'Sửa' : 'Gửi'}
                </Button>

                <div >
                    {userReview && (
                        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                            <Button
                                type="text"
                                icon={<MoreOutlined style={{ fontSize: '20px' }} />}
                            />
                        </Dropdown>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ActionReview;