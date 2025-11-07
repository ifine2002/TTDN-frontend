import {
  ModalForm,
  ProFormText,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import { callCreateComment, callUpdateComment } from "api/services";
import { IComment } from "@/types/backend";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  reloadTable: () => void;
  dataInit: IComment | null;
  setDataInit: (v: IComment | null) => void;
}
const ModalComment = (props: IProps) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const submitComment = async (valuesForm: any) => {
    const { comment, userId, bookId } = valuesForm;
    const ratingComment = valuesForm.ratingComment === "true"; // chuyển string thành boolean

    if (dataInit?.id) {
      //update
      const commentData = {
        comment,
        ratingComment,
      };

      const res = await callUpdateComment(commentData, dataInit.id);
      if (res.data) {
        message.success("Cập nhật comment thành công");
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
      const commentData = {
        comment,
        userId,
        bookId,
        ratingComment,
      };

      const res = await callCreateComment(commentData);
      if (res.data) {
        message.success("Thêm mới comment thành công");
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
        title={<>{dataInit?.id ? "Cập nhật Comment" : "Tạo mới Comment"}</>}
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
        onFinish={submitComment}
        initialValues={
          dataInit?.id
            ? {
                ...dataInit,
                ratingComment: dataInit.ratingComment?.toString(), // ép boolean về string
              }
            : {}
        }
      >
        <Row gutter={16}>
          <Col span={24}>
            <ProFormText
              label="Comment"
              name="comment"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập comment"
            />
          </Col>
          <Col span={24}>
            <ProFormSelect
              label="IsReview"
              name="ratingComment"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Chọn giá trị"
              valueEnum={{
                true: "True",
                false: "False",
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              label="User Id"
              name="userId"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập user id"
              disabled={dataInit?.id ? true : false}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              label="Book Id"
              name="bookId"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập book id"
              disabled={dataInit?.id ? true : false}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalComment;
