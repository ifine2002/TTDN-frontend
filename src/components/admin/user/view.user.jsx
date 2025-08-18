import { Descriptions, Drawer, Image } from "antd";
import dayjs from 'dayjs';

const ViewDetailUser = (props) => {
    const { onClose, open, userDetail, setUserDetail } = props;

    return (
        <>
            <Drawer
                title="Information User"
                placement="right"
                onClose={() => { onClose(false); setUserDetail(null) }}
                open={open}
                width={"40vw"}
                maskClosable={true}
            >
                <Descriptions 
                bordered column={3} 
                layout="vertical"  
                contentStyle={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                            }}
                            size="small"
                >
                <Descriptions.Item label="Image">
                        {userDetail?.image ? (
                            <Image 
                            src={userDetail.image}
                            alt={userDetail.fullName}
                            width={200}
                            style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <span>Không có ảnh</span>
                        )}
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title="" bordered column={3} layout="vertical" size="small">
                    <Descriptions.Item label="Id">{userDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Full Name">{userDetail?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{userDetail?.email}</Descriptions.Item>

                    <Descriptions.Item label="Gender">{userDetail?.gender}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{userDetail?.phone}</Descriptions.Item>

                    <Descriptions.Item label="Role">{userDetail?.role?.name}</Descriptions.Item>
                    <Descriptions.Item label="Address">{userDetail?.address}</Descriptions.Item>
                    <Descriptions.Item label="Date Of Birth">{userDetail && userDetail.userDOB ? dayjs(userDetail.userDOB).format('DD-MM-YYYY') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Status">{userDetail?.status}</Descriptions.Item>

                    <Descriptions.Item label="Total Follower">{userDetail?.follower}</Descriptions.Item>
                    <Descriptions.Item label="Total Following">{userDetail?.following}</Descriptions.Item>

                    <Descriptions.Item label="Created At">{userDetail && userDetail.createdAt ? dayjs(userDetail.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Updated At">{userDetail && userDetail.updatedAt ? dayjs(userDetail.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    
                </Descriptions>
                
            </Drawer>
        </>
    )
}

export default ViewDetailUser;