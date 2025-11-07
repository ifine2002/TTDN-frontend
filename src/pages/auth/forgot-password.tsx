import { callSendTokenResetPassword } from "api/services";
import { Button, Form, Input, notification } from "antd";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    const { email } = values;
    setLoading(true);

    try {
      const res = await callSendTokenResetPassword(email);

      // Kiểm tra kết quả trả về từ API
      if (res && res.status === 200) {
        notification.success({
          message: "Gửi email thành công!",
          description: "Vui lòng kiểm tra email để khôi phục mật khẩu!",
          duration: 5,
        });
        form.resetFields();
      } else if (res && res.status === 400) {
        notification.error({
          message: "Có lỗi xảy ra",
          description: "Email này không tồn tại trong hệ thống!",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="forgot-password-container"
      style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Quên mật khẩu
      </h1>
      <Form
        form={form}
        name="forgot-password"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
            loading={loading}
          >
            Gửi yêu cầu khôi phục mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;
