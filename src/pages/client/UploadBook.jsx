import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  DatePicker,
  Select,
  Typography,
  Form,
  Upload,
  message,
  notification,
  Image,
  Avatar,
} from "antd";
import {
  CloudUploadOutlined,
  UserOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { callUploadBook, callFetchCategoriesUpload } from "../../api/services";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import "../../styles/UploadBook.scss";
import { useAppSelector } from "../../redux/hooks";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const UploadBookPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.account.user);
  const [form] = Form.useForm();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  // Fetch categories
  useEffect(() => {
    setFileList([]);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await callFetchCategoriesUpload("");
      if (res && res.data) {
        setCategories(res.data.result);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // console.log('Connected to WebSocket');
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // Open modal
  const showModal = () => {
    setIsModalOpen(true);
    fetchCategories();
  };

  // Cancel modal
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setIsModalOpen(false);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Hình ảnh phải nhỏ hơn 10MB!");
    }
    return isJpgOrPng && isLt10M;
  };

  // Upload image
  const handleChangeUpload = ({ fileList }) => {
    setFileList(fileList);
  };

  // Submit form
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (fileList.length === 0) {
        message.error("Vui lòng tải lên ảnh bìa sách!");
        setLoading(false);
        return;
      }

      const formData = {
        name: values.name,
        description: values.description,
        author: values.author,
        language: values.language,
        bookFormat: values.bookFormat,
        publishedDate: values.publishedDate.format("YYYY-MM-DD"),
        bookSaleLink: values.bookSaleLink,
        categoryIds: values.categoryIds,
        image: fileList[0]?.originFileObj,
      };

      const res = await callUploadBook(formData);
      if (res && res.data) {
        message.success("Tạo sách mới thành công, đang chờ phê duyệt!");
        // Gửi thông báo đến admin thông qua WebSocket
        if (stompClient && stompClient.connected) {
          const notification = {
            action: "create",
            data: res.data,
            timestamp: new Date().toISOString(),
          };
          stompClient.publish({
            destination: "/topic/admin-books",
            body: JSON.stringify(notification),
          });
        }

        form.resetFields();
        setFileList([]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi tạo sách:", error);
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.response?.data?.message || "Không thể tạo sách",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-book-container min-h-screen">
      <div className="upload-book-content">
        <div className="upload-header">
          <Title level={2}>Thư viện sách của bạn</Title>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={showModal}
          >
            Tải sách mới
          </Button>
        </div>

        <div className="upload-description">
          <Text>
            Chia sẻ những cuốn sách yêu thích của bạn với cộng đồng. Sách của
            bạn sẽ được hiển thị sau khi được quản trị viên phê duyệt.
          </Text>
        </div>

        {/* Modal tạo sách mới */}
        <Modal
          title={
            <div className="modal-header">
              <Button
                type="text"
                onClick={handleCancel}
                className="back-button"
              >
                ←
              </Button>
              <div className="modal-title">Tạo bài viết mới</div>
              <Button
                type="link"
                onClick={() => form.submit()}
                loading={loading}
                className="share-button"
              >
                Chia sẻ
              </Button>
            </div>
          }
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={900}
          className="upload-book-modal"
          closable={false}
          destroyOnClose
          getContainer={false}
        >
          <div className="modal-content">
            <div className="upload-image-container">
              {fileList.length > 0 ? (
                <div className="image-preview">
                  <Button
                    className="delete-image-button"
                    icon={<CloseOutlined />}
                    shape="circle"
                    danger
                    onClick={() => setFileList([])}
                  />
                  <Image
                    src={
                      fileList[0].thumbUrl ||
                      URL.createObjectURL(fileList[0].originFileObj)
                    }
                    alt="Book cover"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                  />
                </div>
              ) : (
                <Upload
                  name="image"
                  listType="picture-card"
                  className="book-cover-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleChangeUpload}
                  maxCount={1}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              )}
            </div>

            <div className="book-form-container">
              <div className="user-info">
                <Avatar src={user.image} icon={<UserOutlined />} size={40} />
                <div className="username">{user.fullName}</div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="book-form"
              >
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sách" },
                  ]}
                >
                  <Input placeholder="Tên sách" />
                </Form.Item>

                <Form.Item
                  name="author"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên tác giả" },
                  ]}
                >
                  <Input placeholder="Tác giả" />
                </Form.Item>

                <Form.Item
                  name="description"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả sách" },
                  ]}
                >
                  <TextArea
                    placeholder="Mô tả sách..."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </Form.Item>

                <Form.Item
                  name="publishedDate"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày xuất bản" },
                  ]}
                >
                  <DatePicker
                    placeholder="Ngày xuất bản"
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item
                  name="language"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngôn ngữ" },
                  ]}
                >
                  <Input placeholder="Language" />
                </Form.Item>

                <Form.Item
                  name="bookFormat"
                  rules={[
                    { required: true, message: "Vui lòng chọn định dạng sách" },
                  ]}
                >
                  <Input placeholder="Định dạng" />
                </Form.Item>

                <Form.Item name="bookSaleLink">
                  <Input placeholder="Liên kết mua sách" />
                </Form.Item>

                <Form.Item
                  name="categoryIds"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ít nhất một danh mục",
                    },
                  ]}
                >
                  <Select placeholder="Chọn danh mục" mode="multiple">
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="form-note">
                  <Text type="secondary">
                    Lưu ý: Sách của bạn sẽ được hiển thị sau khi được quản trị
                    viên phê duyệt.
                  </Text>
                </div>
              </Form>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UploadBookPage;
