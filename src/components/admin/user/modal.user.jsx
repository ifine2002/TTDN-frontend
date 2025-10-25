import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, Row, message, notification, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { isMobile } from "react-device-detect";
import { useState, useEffect } from "react";
import {
  callCreateUser,
  callFetchRole,
  callUpdateUser,
} from "./../../../api/services";
import DebounceSelect from "../../share/DebounceSelect";

const ModalUser = (props) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [roles, setRoles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isDeleteImage, setIsDeleteImage] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setIsDeleteImage(false);

    if (dataInit?.id) {
      if (dataInit.role) {
        setRoles([
          {
            label: dataInit.role?.name,
            value: dataInit.role?.id,
            key: dataInit.role?.id,
          },
        ]);
      }
      form.setFieldsValue({
        ...dataInit,
        role: { label: dataInit.role?.name, value: dataInit.role?.id },
      });

      if (dataInit.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: dataInit.image,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
  }, [dataInit]);

  const handleChangeUpload = ({ fileList }) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      setIsDeleteImage(false);
    }

    setFileList(fileList);
  };

  const beforeUpload = (file) => {
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

  const submitUser = async (valuesForm) => {
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      userDOB,
      address,
      status,
      role,
    } = valuesForm;
    try {
      if (dataInit?.id) {
        //update
        const user = {
          fullName,
          phone,
          gender,
          userDOB,
          address,
          status,
          roleId: role.value,
        };

        if (fileList.length > 0 && fileList[0].originFileObj) {
          user.image = fileList[0].originFileObj;
        }

        if (isDeleteImage) {
          user.deleteImage = true;
        }

        const res = await callUpdateUser(user, dataInit.id);
        message.success("Cập nhật user thành công");
        handleReset();
        reloadTable();
      } else {
        //create
        const user = {
          fullName,
          email,
          password,
          phone,
          gender,
          userDOB,
          address,
          status,
          roleId: role.value,
        };

        if (fileList.length > 0 && fileList[0].originFileObj) {
          user.image = fileList[0].originFileObj;
        }

        const res = await callCreateUser(user);
        message.success("Thêm mới user thành công");
        handleReset();
        reloadTable();
      }
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra";
      if (error.response) {
        if (error.response.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(", ");
          } else {
            errorMessage = error.response.data.message;
          }
        } else {
          errorMessage = error.message;
        }
      } else if (error.request) {
        errorMessage = "Không nhận được phản hồi từ máy chủ";
      } else {
        errorMessage = error.message;
      }

      notification.error({
        message: "Có lỗi xảy ra",
        description: errorMessage,
        duration: 5,
      });
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);
    setRoles([]);
    setFileList([]);
    setIsDeleteImage(false);
    setOpenModal(false);
  };

  async function fetchRoleList(name) {
    const res = await callFetchRole(`page=0&size=100&filter=name~'${name}'`);
    if (res && res.data) {
      const list = res.data.result;
      const temp = list.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      return temp;
    } else return [];
  }

  return (
    <>
      <ModalForm
        title={<>{dataInit?.id ? "Cập nhật User" : "Tạo mới User"}</>}
        open={openModal}
        modalProps={{
          onCancel: () => {
            handleReset();
          },
          afterClose: () => handleReset(),
          destroyOnClose: true,
          width: isMobile ? "100%" : 900,
          keyboard: false,
          maskClosable: false,
          okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
          cancelText: "Hủy",
          getContainer: false,
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitUser}
        initialValues={
          dataInit?.id
            ? {
                ...dataInit,
                role: { label: dataInit.role?.name, value: dataInit.role?.id },
              }
            : {}
        }
      >
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              disabled={dataInit?.id ? true : false}
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng không bỏ trống" },
                { type: "email", message: "Vui lòng nhập email hợp lệ" },
              ]}
              placeholder="Nhập email"
            />
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText.Password
              disabled={dataInit?.id ? true : false}
              label="Password"
              name="password"
              rules={[
                {
                  required: dataInit?.id ? false : true,
                  message: "Vui lòng không bỏ trống",
                },
              ]}
              placeholder={dataInit?.id ? " " : "Nhập password"}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormText
              label="Tên hiển thị"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập tên hiển thị"
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormText
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập phone"
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormSelect
              name="gender"
              label="Giới Tính"
              valueEnum={{
                MALE: "Nam",
                FEMALE: "Nữ",
                OTHER: "Khác",
              }}
              placeholder="Chọn giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProForm.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <DebounceSelect
                allowClear
                showSearch
                defaultValue={roles}
                value={roles}
                placeholder="Chọn vai trò"
                fetchOptions={fetchRoleList}
                onChange={(newValue) => {
                  if (newValue?.length === 0 || newValue?.length === 1) {
                    setRoles(newValue);
                  }
                }}
                style={{ width: "100%" }}
              />
            </ProForm.Item>
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormDatePicker
              label="Ngày sinh"
              name="userDOB"
              placeholder="Chọn ngày sinh"
              fieldProps={{
                format: "DD/MM/YYYY",
              }}
            />
          </Col>
          <Col lg={6} md={6} sm={24} xs={24}>
            <ProFormSelect
              label="Trạng thái"
              name="status"
              valueEnum={{
                NONE: "NONE",
                ACTIVE: "ACTIVE",
                INACTIVE: "INACTIVE",
                DELETED: "DELETED",
              }}
              placeholder="Chọn trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
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
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
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
          <Col lg={12} md={12} sm={24} xs={24}>
            <ProFormText
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
              placeholder="Nhập địa chỉ"
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalUser;
