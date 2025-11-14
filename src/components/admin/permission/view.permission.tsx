import { IPermission } from "types/backend";
import { Descriptions, Drawer } from "antd";
import dayjs from "dayjs";

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IPermission | null;
  setDataInit: (v: any) => void;
}

const ViewDetailPermission = (props: IProps) => {
  const { onClose, open, dataInit, setDataInit } = props;

  return (
    <>
      <Drawer
        title="Thông Tin Quyền Hạn"
        placement="right"
        onClose={() => {
          onClose(false);
          setDataInit(null);
        }}
        open={open}
        width={"40vw"}
        maskClosable={false}
      >
        <Descriptions title="" bordered column={2} layout="vertical">
          <Descriptions.Item label="Tên quyền hạn">
            {dataInit?.name}
          </Descriptions.Item>
          <Descriptions.Item label="API">{dataInit?.apiPath}</Descriptions.Item>

          <Descriptions.Item label="Method">
            {dataInit?.method}
          </Descriptions.Item>
          <Descriptions.Item label="Module">
            {dataInit?.module}
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian tạo">
            {dataInit && dataInit.createdAt
              ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian cập nhật">
            {dataInit && dataInit.updatedAt
              ? dayjs(dataInit.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default ViewDetailPermission;
