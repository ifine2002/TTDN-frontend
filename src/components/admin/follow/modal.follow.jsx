import { FooterToolbar, ModalForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { callCreateFollow, } from "./../../../api/services";
import { CheckSquareOutlined } from "@ant-design/icons";
import { useAppDispatch } from "./../../../redux/hooks";


const ModalFollow = (props) => {
    const { openModal, setOpenModal, reloadTable } = props;
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();


    const submitFollow = async (valuesForm) => {
        const { followerId, followingId } = valuesForm;
        
        //create
        const follow = {
            followerId, followingId
        }
        const res = await callCreateFollow(follow);
        if (res.data) {
            message.success("Thêm mới follow thành công");
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{"Tạo mới Follow"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{"Tạo mới"}</>,
                    cancelText: "Hủy",
                    getContainer: false

                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitFollow}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Follower Id"
                            name="followerId"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập follower id"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Following Id"
                            name="followingId"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập following id"
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalFollow;
