import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { callVerifyEmail, callResendToken } from './../../api/services';

const COOLDOWN_TIME = 60; // 60 giây
const MAX_RESEND_ATTEMPTS = 3; // Số lần gửi lại tối đa

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [resendAttempts, setResendAttempts] = useState(0);
    const email = searchParams.get('email');

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const onFinish = async (values) => {
        const { verificationCode } = values;
        setLoading(true);
        try {
            const res = await callVerifyEmail(email, verificationCode);
            if (res && res.status === 200) {
                message.success('Xác thực email thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                message.error('Mã xác thực không đúng hoặc hết thời hạn! Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra trong quá trình xác thực!');
        } finally {
            setLoading(false);
        }
    };

    const handleResendToken = async () => {
        if (cooldown > 0) {
            message.warning(`Vui lòng đợi ${cooldown} giây trước khi gửi lại mã!`);
            return;
        }

        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
            message.error('Bạn đã vượt quá số lần gửi lại mã cho phép. Vui lòng liên hệ hỗ trợ!');
            return;
        }

        try {
            const res = await callResendToken(email);
            if (res && res.status === 200) {
                message.success('Mã xác thực đã được gửi đến email của bạn!');
                setCooldown(COOLDOWN_TIME);
                setResendAttempts(prev => prev + 1);
            } else {
                message.error('Có lỗi xảy ra trong quá trình gửi mã xác thực!');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra trong quá trình gửi mã xác thực!');
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Lỗi
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Không tìm thấy thông tin email. Vui lòng đăng ký lại.
                        </p>
                        <Button
                            type="primary"
                            onClick={() => navigate('/register')}
                            className="mt-4"
                        >
                            Quay lại đăng ký
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Xác thực Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Vui lòng nhập mã xác thực đã được gửi đến email của bạn
                    </p>
                    <p className="mt-1 text-sm font-medium text-indigo-600">
                        {email}
                    </p>
                </div>

                <Form
                    name="verify-email"
                    onFinish={onFinish}
                    autoComplete="off"
                    className="mt-8 space-y-6"
                >
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label="Mã xác thực"
                        name="verificationCode"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã xác thực!' },
                            { len: 6, message: 'Mã xác thực phải có 6 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập mã xác thực 6 ký tự"
                            maxLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Xác thực
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Không nhận được mã?
                            <Button
                                type="link"
                                onClick={handleResendToken}
                                disabled={cooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS}
                                className="text-indigo-600 hover:text-indigo-500"
                            >
                                {cooldown > 0
                                    ? `Gửi lại (${cooldown}s)`
                                    : `Gửi lại (${MAX_RESEND_ATTEMPTS - resendAttempts} lần còn lại)`}
                            </Button>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default VerifyEmailPage; 