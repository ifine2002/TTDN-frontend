import { Modal, Tabs, List, Avatar, Button, Divider, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { IUser } from "@/types/backend";

const { TabPane } = Tabs;
interface IProps {
  followerVisible: boolean;
  handleModalClose: () => void;
  activeModalTab: string;
  setActiveModalTab: (v: string) => void;
  userData: IUser;
  followerStates: { [userId: number]: boolean };
  followingStates: { [userId: number]: boolean };
  handleFollowerFollowToggle: (userId: number) => void;
  handleFollowToggle: (userId: number) => void;
}
const FollowersModal = ({
  followerVisible,
  handleModalClose,
  activeModalTab,
  setActiveModalTab,
  userData,
  followerStates,
  followingStates,
  handleFollowerFollowToggle,
  handleFollowToggle,
}: IProps) => {
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
        <TabPane
          tab={`Follower ${userData.follower?.length || 0}`}
          key="followers"
        >
          {userData.follower && userData.follower.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={userData.follower}
              renderItem={(user, index) => (
                <>
                  <List.Item
                    actions={[
                      <Button
                        key="follow-back"
                        size="small"
                        onClick={() => handleFollowerFollowToggle(user.id)}
                        className={`${
                          followerStates[user.id]
                            ? "bg-gray-500 hover:!bg-gray-600"
                            : "bg-blue-500 hover:!bg-blue-600"
                        } w-20 !text-white hover:!text-white`}
                        style={{ border: "none" }}
                      >
                        {followerStates[user.id] ? "Đã follow" : "Follow lại"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={user.image}
                          icon={!user.image && <UserOutlined />}
                        />
                      }
                      title={
                        <Link
                          to={`/profile/${user.id}`}
                          onClick={handleModalClose}
                        >
                          {user.fullName}
                        </Link>
                      }
                    />
                  </List.Item>
                  {index < userData.follower!.length - 1 && (
                    <Divider className="my-2" />
                  )}
                </>
              )}
            />
          ) : (
            <Empty description="Không có người theo dõi nào" />
          )}
        </TabPane>
        <TabPane
          tab={`Đã follow ${userData.following?.length || 0}`}
          key="following"
        >
          {userData.following && userData.following.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={userData.following}
              renderItem={(user, index) => (
                <>
                  <List.Item
                    actions={[
                      <Button
                        key="unfollow"
                        size="small"
                        onClick={() => handleFollowToggle(user.id)}
                        className={`${
                          followingStates[user.id]
                            ? "bg-gray-500 hover:!bg-gray-600"
                            : "bg-blue-500 hover:!bg-blue-600"
                        } w-20 !text-white hover:!text-white`}
                        style={{ border: "none" }}
                      >
                        {followingStates[user.id] ? "Đã follow" : "Follow"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={user.image}
                          icon={!user.image && <UserOutlined />}
                        />
                      }
                      title={
                        <Link
                          to={`/profile/${user.id}`}
                          onClick={handleModalClose}
                        >
                          {user.fullName}
                        </Link>
                      }
                    />
                  </List.Item>
                  {index < userData.following!.length - 1 && (
                    <Divider className="my-2" />
                  )}
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
