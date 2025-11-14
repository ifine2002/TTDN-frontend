import { IUserDetail } from "types/backend";
import { Descriptions, Drawer, Image } from "antd";
import dayjs from "dayjs";

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  userDetail: IUserDetail | null;
  setUserDetail: (user: IUserDetail | null) => void;
}
const ViewDetailUser = (props: IProps) => {
  const { onClose, open, userDetail, setUserDetail } = props;

  return (
    <>
      <Drawer
        title="Thông Tin Chi Tiết Người Dùng"
        placement="right"
        onClose={() => {
          onClose(false);
          setUserDetail(null);
        }}
        open={open}
        width={"40vw"}
        maskClosable={true}
      >
        <Descriptions
          bordered
          column={3}
          layout="vertical"
          contentStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          size="small"
        >
          <Descriptions.Item label="Hình ảnh">
            {userDetail?.image ? (
              <Image
                src={userDetail.image as string}
                alt={userDetail.fullName}
                width={200}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span>Không có ảnh</span>
            )}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions
          title=""
          bordered
          column={3}
          layout="vertical"
          size="small"
        >
          <Descriptions.Item label="ID">{userDetail?.id}</Descriptions.Item>
          <Descriptions.Item label="Tên hiển thị">
            {userDetail?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {userDetail?.email}
          </Descriptions.Item>

          <Descriptions.Item label="Giới tính">
            {userDetail?.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {userDetail?.phone}
          </Descriptions.Item>

          <Descriptions.Item label="Vai trò">
            {userDetail?.role?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {userDetail?.address}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {userDetail && userDetail.userDOB
              ? dayjs(userDetail.userDOB).format("DD-MM-YYYY")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {userDetail?.status}
          </Descriptions.Item>

          <Descriptions.Item label="Tổng số follower">
            {userDetail?.follower}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số following">
            {userDetail?.following}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian tạo">
            {userDetail && userDetail.createdAt
              ? dayjs(userDetail.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian cập nhật">
            {userDetail && userDetail.updatedAt
              ? dayjs(userDetail.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default ViewDetailUser;
