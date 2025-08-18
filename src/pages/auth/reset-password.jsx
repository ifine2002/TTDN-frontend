import { useNavigate, useLocation } from 'react-router-dom';
import { callResetPassword } from './../../api/services';
import { Button, Form, Input, notification } from 'antd';
import { useState } from 'react';

const ResetPasswordPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    console.log("check token", token);
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await callResetPassword(token, {
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            });

            if (res && res.status === 200) {
                notification.success({
                    message: 'Đổi mật khẩu thành công!',
                    description: 'Vui lòng đăng nhập lại với mật khẩu mới.',
                    duration: 5
                });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if(res && res.status === 400){
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message,
                    duration: 5
                });
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: 'Token không hợp lệ',
                    duration: 5
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.',
                duration: 5
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Đặt Lại Mật Khẩu</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Xác nhận mật khẩu mới" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                        Đặt lại mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ResetPasswordPage;
