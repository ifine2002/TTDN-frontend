import DataTable from "./../../components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import { callDeleteComment } from "./../../api/services";
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";
import { fetchComment } from "../../redux/slice/commentSlice";
import ModalComment from "../../components/admin/comment/modal.comment";

const CommentPage = () => {

    const [dataInit, setDataInit] = useState(null);
    const tableRef = useRef();

    const [openModal, setOpenModal] = useState(false)
    const isFetching = useAppSelector(state => state.comment.isFetching);
    const data = useAppSelector(state => state.comment.data);
    const comments = useAppSelector(state => state.comment.result);

    const dispatch = useAppDispatch();

    const handleDeleteComment = async (id) => {
        if (id) {
            const res = await callDeleteComment(id);
            if (res && res.status === 200) {
                message.success('Xóa Comment thành công');
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
            title: 'Comment',
            dataIndex: 'comment',
        },
        {
            title: 'IsReview',
            dataIndex: 'ratingComment',
            render: (text, record) => {
                return (
                    <>{record.ratingComment !== undefined ? (record.ratingComment ? 'True' : 'False') : ''}</>
                )
            },
            valueType: 'select',
            valueEnum: {
                true: {
                    text: 'True',
                },
                false: {
                    text: 'False',
                },
            },
            sorter: true,
        },
        {
            title: 'User Id',
            dataIndex: 'userId',
            sorter: true,
        },
        {
            title: 'Book Id',
            dataIndex: 'bookId',
            sorter: true,
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
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa comment"}
                        description={"Bạn có chắc chắn muốn xóa comment này ?"}
                        onConfirm={() => handleDeleteComment(entity.id)}
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

        if (clone.comment) filterArray.push(`${sfLike("comment", clone.comment)}`);

        if (clone.ratingComment) {
            console.log("check ratingBool: ", ratingBool)
            filterArray.push(`isRatingComment=${ratingBool}`);
        }

        if (clone.userId) filterArray.push(`${sfLike("userId", clone.userId)}`);

        if (clone.bookId) filterArray.push(`${sfLike("bookId", clone.bookId)}`);
        
        if (filterArray.length > 0) {
            q.filter = filterArray.join(" and ");
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.id) {
            sortBy = sort.id === 'ascend' ? "sort=id,asc" : "sort=id,desc";
        }
        if (sort && sort.userId) {
            sortBy = sort.userId === 'ascend' ? "sort=userId,asc" : "sort=userId,desc";
        }
        if (sort && sort.bookId) {
            sortBy = sort.bookId === 'ascend' ? "sort=bookId,asc" : "sort=bookId,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

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
                headerTitle="Danh sách Rating"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={comments}
                request={async (params, sort, filter) => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchComment({ query }))
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
            <ModalComment
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default CommentPage;