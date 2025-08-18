import { Modal, Tabs, List, Avatar, Button, Divider, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { calUnfollow, callCreateFollow } from '../../../api/services';
import { useAppDispatch } from '../../../redux/hooks';
import { fetchFollowing } from '../../../redux/slice/followSlice';

const { TabPane } = Tabs;

const FollowersModal = ({
    followerVisible,
    handleModalClose,
    activeModalTab,
    setActiveModalTab,
    userData,
    listFollowing,
    currentUser
}) => {
    const dispatch = useAppDispatch();

    // Hàm kiểm tra xem user có trong listFollowing không
    const isUserInFollowingList = (userId) => {
        return listFollowing?.some(user => user.id === userId) || false;
    };

    const isCurrentUser = (userId) => {
        return currentUser?.id === userId;
    };

    const handleFollowToggle = async (userId) => {
        try {
            const isFollowing = listFollowing?.some(user => user.id === userId);
            const follow = {
                followerId: currentUser.id,
                followingId: userId
            };
    
            if (isFollowing) {
                await calUnfollow(follow);
            } else {
                await callCreateFollow(follow);
            }
            // Sau khi thao tác thành công, cập nhật lại danh sách following
            dispatch(fetchFollowing({ query: '' }));
        } catch (error) {
            console.error("Lỗi khi thực hiện follow/unfollow:", error);
        }
    };

    const renderFollowButton = (user) => {
        if (isCurrentUser(user.id)) {
            return null; // Không hiển thị nút nếu là user đang đăng nhập
        }
    
        return (
            <Button 
                key="follow" 
                size="small"
                onClick={() => handleFollowToggle(user.id)}
                className={`${isUserInFollowingList(user.id) ? 'bg-gray-500 hover:!bg-gray-600' : 'bg-blue-500 hover:!bg-blue-600'} w-20 !text-white hover:!text-white`}
                style={{ border: 'none' }}
            >
                {isUserInFollowingList(user.id) ? 'Đã follow' : 'Follow'}
            </Button>
        );
    };

    return (
        <Modal
            title="Người dùng"
            open={followerVisible}
            onCancel={handleModalClose}
            footer={null}
            width={600}
            getContainer={false}
        >
            <Tabs 
                defaultActiveKey={activeModalTab}
                activeKey={activeModalTab}
                onChange={(key) => setActiveModalTab(key)}
            >
                <TabPane tab={`Follower ${userData.follower?.length || 0}`} key="followers">
                    {userData.follower && userData.follower.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={userData.follower}
                            renderItem={(user, index) => (
                                <>
                                    <List.Item
                                        actions={[
                                            renderFollowButton(user)
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src={user.image} icon={!user.image && <UserOutlined />} />}
                                            title={<Link to={`/profile/${user.id}`} onClick={handleModalClose}>{user.fullName}</Link>}
                                        />
                                    </List.Item>
                                    {index < userData.follower.length - 1 && <Divider className="my-2" />}
                                </>
                            )}
                        />
                    ) : (
                        <Empty description="Không có người theo dõi nào" />
                    )}
                </TabPane>
                <TabPane tab={`Đã follow ${userData.following?.length || 0}`} key="following">
                    {userData.following && userData.following.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={userData.following}
                            renderItem={(user, index) => (
                                <>
                                    <List.Item
                                        actions={[
                                            renderFollowButton(user)
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src={user.image} icon={!user.image && <UserOutlined />} />}
                                            title={<Link to={`/profile/${user.id}`} onClick={handleModalClose}>{user.fullName}</Link>}
                                        />
                                    </List.Item>
                                    {index < userData.following.length - 1 && <Divider className="my-2" />}
                                </>
                            )}
                        />
                    ) : (
                        <Empty description="Không theo dõi ai" />
                    )}
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default FollowersModal; 