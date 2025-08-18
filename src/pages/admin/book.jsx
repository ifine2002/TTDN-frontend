import DataTable from "./../../components/client/data-table/index";
import { fetchBook } from "./../../redux/slice/bookSlice";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteBook, callGetBookById } from "./../../api/services";
import queryString from 'query-string';
import { sfLike } from "spring-filter-query-builder";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import ModalBook from "../../components/admin/book/modal.book";

const BookPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [bookDetail, setBookDetail] = useState(null);

    const tableRef = useRef();

    const dispatch = useAppDispatch();
    const isFetching = useAppSelector(state => state.book.isFetching);
    const data = useAppSelector(state => state.book.data || {});
    const books = useAppSelector(state => state.book.result || []);



    const handleDeleteBook = async (id) => {
        if (id) {
            const res = await callDeleteBook(id);
            if (+res.status === 200) {
                message.success('Xóa Book thành công');
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

    const handleViewDetail = async (record) => {
        const res = await callGetBookById(record.id);
        setBookDetail(res.data)
        setOpenViewDetail(true);
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.id}
                    </span>
                )
            },
            hideInSearch: true,
            sorter: true,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            hideInSearch: true,
            sorter: true,
        },

        {
            title: 'Category',
            dataIndex: "categories",
            render: (categories) => {
                if (!categories || !Array.isArray(categories) || categories.length === 0) return "-";
                return categories.map(cat => cat.name).join(", ");
            },
            fieldProps: {
                placeholder: 'Tìm kiếm theo tên category',
            },
        },
        {
            title: 'CreatedBy',
            dataIndex: 'createdBy',
            fieldProps: {
                placeholder: 'Tìm kiếm theo người tạo',
            },
            sorter: true,
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record) => {
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
            render: (text, record) => {
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
            render: (_value, entity) => (
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
                        title={"Xác nhận xóa book"}
                        description={"Bạn có chắc chắn muốn xóa book này ?"}
                        onConfirm={(e) => {
                            e.stopPropagation();
                            handleDeleteBook(entity.id);
                        }}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span 
                            style={{ cursor: "pointer", margin: "0 10px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
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
        
        if (clone.name) filterArray.push(`${sfLike("name", clone.name)}`);
        if (clone.categories) filterArray.push(`${sfLike("categories.name", clone.categories)}`);
        if (clone.createdBy) filterArray.push(`${sfLike("createdBy", clone.createdBy)}`);
        
        if (filterArray.length > 0) {
            q.filter = filterArray.join(" and ");
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.description) {
            sortBy = sort.description === 'ascend' ? "sort=description,asc" : "sort=description,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
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
                headerTitle="Danh sách Books"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={books}
                request={async (params, sort, filter) => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchBook({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: data.page,
                        pageSize: data.pageSize,
                        showSizeChanger: true,
                        total: data.total,
                        showTotal: (total, range) => { 
                            return (<div> {range[0]}-{range[1]} trên {total} rows</div>);
                        },
                    }
                }
                rowSelection={false}
                toolBarRender={() => {
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
                onRow={(record) => {
                    return {
                        onClick: (event) => {
                            if (!event.target.closest('.ant-space')) {
                                handleViewDetail(record);
                            }
                        },
                        style: { cursor: 'pointer' }
                    };
                }}
            />
            <ModalBook
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            {/* <ViewDetailUser
                onClose={() => setOpenViewDetail(false)}
                open={openViewDetail}
                bookDetail={bookDetail}
                setBookDetail={setBookDetail}
            /> */}
        </div>
    )
}

export default BookPage;