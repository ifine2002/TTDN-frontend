import {
  ModalForm,
  ProFormText,
  ProFormDigit,
} from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import { callCreateRating, callUpdateRating } from "api/services";
import { IRating } from "@/types/backend";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  reloadTable: () => void;
  dataInit: IRating | null;
  setDataInit: (v: IRating | null) => void;
}

const ModalRating = (props: IProps) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const submitRating = async (valuesForm: any) => {
    const { stars, userId, bookId } = valuesForm;
    if (dataInit?.id) {
      //update
      const rating: IRating = {
        stars,
      };

      const res = await callUpdateRating(rating, dataInit.id);
      if (res.data) {
        message.success("Cập nhật rating thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } else {
      //create
      const rating = {
        stars,
        userId,
        bookId,
      };

      const res = await callCreateRating(rating);
      if (res.data) {
        message.success("Thêm mới rating thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);
    setOpenModal(false);
  };

  return (
    <>
      <ModalForm
        title={<>{dataInit?.id ? "Cập nhật Rating" : "Tạo mới Rating"}</>}
        open={openModal}
        modalProps={{
          onCancel: () => {
            handleReset();
          },
          afterClose: () => handleReset(),
          destroyOnClose: true,
          width: isMobile ? "100%" : 600,
          keyboard: false,
          maskClosable: false,
          okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
          cancelText: "Hủy",
          getContainer: false,
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitRating}
        initialValues={dataInit?.id ? dataInit : {}}
      >
        <Row gutter={16}>
          <Col span={8}>
            <ProFormDigit
              label="Stars"
              name="stars"
              rules={[
                { required: true, message: "Vui lòng không bỏ trống" },
                {
                  type: "number",
                  min: 1,
                  message: "Giá trị phải lớn hơn hoặc bằng 1",
                },
                {
                  type: "number",
                  max: 5,
                  message: "Giá trị không được lớn hơn 5",
                },
              ]}
              placeholder="Nhập stars (1-5)"
              min={1}
              max={5}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="User Id"
              name="userId"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập user id"
            />
          </Col>
          <Col span={8}>
            <ProFormText
              label="Book Id"
              name="bookId"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập book id"
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalRating;
