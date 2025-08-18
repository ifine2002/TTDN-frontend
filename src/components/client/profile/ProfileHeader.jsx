import { Card, Avatar, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { calUnfollow, callCreateFollow } from '../../../api/services';

const { Title, Text } = Typography;

const ProfileHeader = ({ 
    userData, 
    isFollowing, 
    setIsFollowing,
    showFollowersModal, 
    showFollowingModal, 
    headerRef,
    currentUser
}) => {
    const toggleFollow = async () => {
        try {
            if (isFollowing) {
                const follow = {
                    followerId: currentUser.id,
                    followingId: userData.id
                };
                const res = await calUnfollow(follow);
                setIsFollowing(false);
            } else {
                const follow = {
                    followerId: currentUser.id,
                    followingId: userData.id
                };
                const res = await callCreateFollow(follow);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện follow/unfollow:", error);
        }
    };

    return (
        <div style={{ height: 'auto', minHeight: '160px' }}>
            <Card 
                className="mb-6 shadow-md profile-user-header"
                ref={headerRef}
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-2 flex justify-center items-center">
                        <Avatar 
                            src={userData.image} 
                            icon={!userData.image && <UserOutlined />} 
                            size={100}
                            className="border border-gray-200"
                        />
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-center min-h-[120px]">
                        <Title level={4} className="mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                            {userData.fullName}
                        </Title>
                        <div className="flex gap-4 text-gray-600">
                            <Text className="cursor-pointer hover:text-blue-500" onClick={showFollowersModal}>
                                <span className="font-bold">{userData.follower?.length || 0}</span> Follower
                            </Text>
                            <Text className="cursor-pointer hover:text-blue-500" onClick={showFollowingModal}>
                                <span className="font-bold">{userData.following?.length || 0}</span> Đã follow
                            </Text>
                        </div>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-center md:justify-end">
                        <Button 
                            onClick={toggleFollow}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-base transition 
                                        ${isFollowing === false ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                        >
                            {isFollowing === false ? 'Follow' : 'Đã Follow'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfileHeader; 