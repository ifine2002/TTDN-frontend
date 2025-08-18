import DataTable from "./../../components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { callDeleteFollow } from "./../../api/services";
import queryString from 'query-string';
import { fetchFollow } from "./../../redux/slice/followSlice";
import { sfLike } from "spring-filter-query-builder";
import ModalFollow from "../../components/admin/follow/modal.follow";

const FollowPage = () => {
    const tableRef = useRef();
    const [openModal, setOpenModal] = useState(false)
    const isFetching = useAppSelector(state => state.follow.isFetching);
    const data = useAppSelector(state => state.follow.data);
    const follows = useAppSelector(state => state.follow.result);

    const dispatch = useAppDispatch();

    const handleDeleteFollow = async (id) => {
        if (id) {
            const res = await callDeleteFollow(id);
            if (res && res.status === 200) {
                message.success('Xóa Follow thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.id}
                    </span>
                )
            },
        },
        {
            title: 'Follower Id',
            dataIndex: 'followerId',
            sorter: true,
        },
        {
            title: 'Following  Id',
            dataIndex: 'followingId',
            sorter: true,
            fieldProps: {
                placeholder: 'Tìm kiếm theo Following Id',
                style: { marginLeft: 5 }
            },
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'CreatedBy',
            dataIndex: 'createdBy',
            sorter: true,
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa follow"}
                        description={"Bạn có chắc chắn muốn xóa follow này ?"}
                        onConfirm={() => handleDeleteFollow(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm>
                </Space>
            ),

        },
    ];

    const buildQuery = (params, sort, filter) => {
        const q = {
            page: params.current - 1,
            size: params.pageSize,
            filter: ""
        }

        const clone = { ...params };
        let filterArray = [];
        
        if (clone.id) filterArray.push(`${sfLike("id", clone.id)}`);

        if (clone.followerId) filterArray.push(`${sfLike("follower.id", clone.followerId)}`);

        if (clone.followingId) filterArray.push(`${sfLike("following.id", clone.followingId)}`);

        if (clone.createdBy) filterArray.push(`${sfLike("createdBy", clone.createdBy)}`);
        
        if (filterArray.length > 0) {
            q.filter = filterArray.join(" and ");
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.id) {
            sortBy = sort.id === 'ascend' ? "sort=id,asc" : "sort=id,desc";
        }
        if (sort && sort.followerId) {
            sortBy = sort.followerId === 'ascend' ? "sort=followerId,asc" : "sort=followerId,desc";
        }
        if (sort && sort.followingId) {
            sortBy = sort.followingId === 'ascend' ? "sort=followingId,asc" : "sort=followingId,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.createdBy) {
            sortBy = sort.createdBy === 'ascend' ? "sort=createdBy,asc" : "sort=createdBy,desc";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }
    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle="Danh sách Follow"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={follows}
                request={async (params, sort, filter) => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchFollow({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: data.page,
                        pageSize: data.pageSize,
                        showSizeChanger: true,
                        total: data.total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows) => {
                    return (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            Thêm mới
                        </Button>
                    );
                }}
            />
            <ModalFollow
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
            />
        </div>
    )
}

export default FollowPage;