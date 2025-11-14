import { ModalForm, ProFormText, ProForm } from "@ant-design/pro-components";
import {
  Col,
  Form,
  Row,
  message,
  notification,
  Upload,
  UploadFile,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { isMobile } from "react-device-detect";
import { callCreateCategory, callUpdateCategory } from "api/services";
import { useState, useEffect } from "react";
import { ICategory } from "@/types/backend";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { UploadProps } from "antd/lib";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  reloadTable: () => void;
  dataInit: ICategory | null;
  setDataInit: (v: ICategory | null) => void;
}

interface IUploadFileWithOrigin extends UploadFile {
  originFileObj?: RcFile;
}

const ModalCategory = (props: IProps) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<IUploadFileWithOrigin[]>([]);
  const [isDeleteImage, setIsDeleteImage] = useState(false);

  const handleChangeUpload = ({
    fileList,
  }: UploadChangeParam<IUploadFileWithOrigin>) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      setIsDeleteImage(false);
    }

    setFileList(fileList);
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpeg";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Hình ảnh phải nhỏ hơn 10MB!");
    }
    return isJpgOrPng && isLt10M;
  };

  const handleRemove = () => {
    setFileList([]);
    if (dataInit?.id && dataInit.image) {
      setIsDeleteImage(true);
    }
    return true;
  };

  const submitCategory = async (valuesForm: any) => {
    const { name, description } = valuesForm;
    if (dataInit?.id) {
      //update
      const category = {
        name,
        description,
        deleteImage: false,
        image: fileList[0]?.originFileObj,
      };

      if (fileList.length > 0 && fileList[0].originFileObj) {
        category.image = fileList[0].originFileObj;
      }

      if (isDeleteImage) {
        category.deleteImage = true;
      }

      const res = await callUpdateCategory(category, dataInit.id);
      if (res.data) {
        message.success("Cập nhật category thành công");
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
      const category = {
        name,
        description,
        image: fileList[0]?.originFileObj,
      };
      if (fileList.length > 0 && fileList[0].originFileObj) {
        category.image = fileList[0].originFileObj;
      }
      const res = await callCreateCategory(category);
      if (res.data) {
        message.success("Thêm mới category thành công");
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
    setFileList([]);
    setIsDeleteImage(false);
  };

  useEffect(() => {
    setIsDeleteImage(false);

    if (dataInit?.id) {
      if (dataInit.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: dataInit.image.toString(),
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
  }, [dataInit]);

  const dummyRequest: UploadProps["customRequest"] = (options) => {
    const {
      onSuccess /*, onError, onProgress, file, filename, data, headers, withCredentials*/,
    } = options;

    // Mô phỏng upload thành công
    setTimeout(() => {
      onSuccess?.("ok" as any); // body có thể là bất kỳ, onSuccess param là optional
    }, 0);
  };

  return (
    <>
      <ModalForm
        title={<>{dataInit?.id ? "Cập nhật thể loại" : "Tạo mới thể loại"}</>}
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
        onFinish={submitCategory}
        initialValues={dataInit?.id ? dataInit : {}}
      >
        <Row gutter={16}>
          <Col span={8}>
            <ProFormText
              label="Tên thể loại"
              name="name"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập tên thể loại"
            />
          </Col>
          <Col span={16}>
            <ProFormText
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập mô tả"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProForm.Item
              name="image"
              label="Hình ảnh"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleChangeUpload}
                onRemove={handleRemove}
                maxCount={1}
                customRequest={dummyRequest}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </ProForm.Item>
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalCategory;
