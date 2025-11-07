import React from "react";
import { Card, Avatar, Typography, Button } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { IUser } from "@/types/backend";

const { Title, Text } = Typography;

interface IProps {
  userData: IUser;
  headerRef: React.Ref<HTMLDivElement>;
  showFollowersModal: () => void;
  showFollowingModal: () => void;
  editProfile: () => void;
}

const ProfileHeader = ({
  userData,
  headerRef,
  showFollowersModal,
  showFollowingModal,
  editProfile,
}: IProps) => {
  return (
    <div style={{ height: "auto", minHeight: "160px" }}>
      <Card className="mb-6 shadow-md profile-user-header" ref={headerRef}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2 flex justify-center items-center">
            <Avatar
              src={
                typeof userData.image === "string" ? userData.image : undefined
              }
              icon={!userData.image && <UserOutlined />}
              size={100}
              className="border border-gray-200"
            />
          </div>
          <div className="md:col-span-7 flex flex-col justify-center min-h-[120px]">
            <Title
              level={4}
              className="mb-1 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {userData.fullName}
            </Title>
            <div className="flex gap-4 text-gray-600">
              <Text
                className="cursor-pointer hover:text-blue-500"
                onClick={showFollowersModal}
              >
                <span className="font-bold">
                  {userData.follower?.length || 0}
                </span>{" "}
                Follower
              </Text>
              <Text
                className="cursor-pointer hover:text-blue-500"
                onClick={showFollowingModal}
              >
                <span className="font-bold">
                  {userData.following?.length || 0}
                </span>{" "}
                Đã follow
              </Text>
            </div>
          </div>
          <div className="md:col-span-3 flex items-center justify-center md:justify-end">
            <Button
              onClick={editProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-md !text-black text-base transition bg-[#e2e5e9] hover:!bg-[#bcbfc3]"
              icon={<EditOutlined />}
              style={{ border: "none" }}
            >
              Quản lý tài khoản
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileHeader;
