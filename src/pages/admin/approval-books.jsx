import { useState, useRef, useEffect } from 'react';
import { Button, Space, message, notification, Badge, Tag, Image, Descriptions, Modal, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import DataTable from "../../components/client/data-table/index";
import dayjs from 'dayjs';
import { sfLike } from "spring-filter-query-builder";
import queryString from 'query-string';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import { callApproveBook, callRejectBook, callGetApproveBooks } from '../../api/services';
import BookDetailModal from '../../components/admin/book/modal.book-detail';

const ApprovalBooksPage = () => {
    const [books, setBooks] = useState([]);

    const [data, setData] = useState({
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    });
    const [isFetching, setIsFetching] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [bookDetail, setBookDetail] = useState(null);

    const tableRef = useRef();

    // Kết nối WebSocket
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                // console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // console.log('Connected to WebSocket');
            
            // Đăng ký nhận thông báo khi có sách mới được đăng
            client.subscribe('/topic/admin-books', (message) => {
                try {
                    const notificationData = JSON.parse(message.body);
                    // console.log('WebSocket notification received:', notificationData);
                    
                    // Phân biệt loại thông báo dựa trên action
                    const action = notificationData.action;
                    
                    if (action === 'create') {
                        const newBook = notificationData.data;
                        // Cập nhật danh sách sách nếu đang ở trang đầu tiên
                        if (data.page === 1) {
                            setBooks(prevBooks => {
                                // Kiểm tra nếu sách đã tồn tại trong danh sách
                                const existingBookIndex = prevBooks.findIndex(book => book.bookId === newBook.bookId);
                                
                                if (existingBookIndex >= 0) {
                                    // Cập nhật sách đã tồn tại
                                    const updatedBooks = [...prevBooks];
                                    updatedBooks[existingBookIndex] = newBook;
                                    return updatedBooks;
                                } else {
                                    // Thêm sách mới vào đầu danh sách
                                    return [newBook, ...prevBooks];
                                }
                            });
                            
                            // Cập nhật tổng số sách
                            setData(prevData => ({
                                ...prevData,
                                total: prevData.total + 1
                            }));
                        } else {
                            // Thông báo có sách mới nếu không ở trang đầu
                            notification.info({
                                message: 'Sách mới',
                                description: `Sách "${newBook.bookName}" vừa được đăng và đang chờ duyệt`,
                            });
                        }
                    } else if (action === 'approve' || action === 'reject') {
                        // Reload dữ liệu khi có sách được duyệt hoặc từ chối
                        reloadTable();
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [data.page]);

    // Xử lý duyệt sách
    const handleApproveBook = async (bookId) => {
        try {
            const res = await callApproveBook(bookId);
            if (res.status === 200) {
                message.success('Duyệt sách thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message || 'Không thể duyệt sách'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message || 'Không thể duyệt sách'
            });
        }
    };

    // Xử lý từ chối sách
    const handleRejectBook = async (bookId) => {
        try {
            const res = await callRejectBook(bookId);
            if (res.status === 200) {
                message.success('Từ chối sách thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message || 'Không thể từ chối sách'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message || 'Không thể từ chối sách'
            });
        }
    };

    // Xem chi tiết sách
    const handleViewDetail = (record) => {
        setBookDetail(record);
        setOpenViewDetail(true);
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'bookId',
            width: 50,
            render: (text) => text,
            hideInSearch: true,
            sorter: true,
        },
        {
            title: 'Book Image',
            dataIndex: 'imageBook',
            width: 100,
            render: (image) => (
                <Image
                    width={80}
                    src={image}
                    alt="book"
                />
            ),
            hideInSearch: true,
        },
        {
            title: 'Book Name',
            dataIndex: 'bookName',
            sorter: true,
            render: (text, record) => (
                <div>
                    <div className="font-bold">{text}</div>
                </div>
            ),
        },
        {
            title: 'Poster',
            dataIndex: 'fullName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {record.avatar && (
                        <Image
                            width={40}
                            height={35}
                            src={record.avatar}
                            alt="avatar"
                            style={{ borderRadius: '50%', marginRight: '8px' }}
                        />
                    )}
                    <span>{text}</span>
                </div>
            ),
            fieldProps: {
                placeholder: 'Tìm kiếm theo người đăng',
            },
        },
        {
            title: 'User Id',
            dataIndex: 'userId',
            render: (text) => text,
            hideInSearch: true,
        },
        {
            title: 'Categories',
            dataIndex: 'categories',
            render: (categories) => {
                if (!categories || categories.length === 0) return "-";
                return (
                    <div style={{ maxWidth: '200px' }}>
                        {categories.map(cat => (
                            <Tag key={cat.id} color="blue">{cat.name}</Tag>
                        ))}
                    </div>
                );
            },
            fieldProps: {
                placeholder: 'Tìm kiếm theo thể loại',
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            width: 180,
            sorter: true,
            render: (text) => text ? dayjs(text).format('DD-MM-YYYY HH:mm:ss') : "",
            hideInSearch: true,
        },
        {
            title: 'Action',
            hideInSearch: true,
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Detail">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                            type="default"
                        />
                    </Tooltip>
                    <Tooltip title="Approval">
                        <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApproveBook(record.bookId)}
                            type="primary"
                            style={{ backgroundColor: '#52c41a' }}
                        />
                    </Tooltip>
                    <Tooltip title="Reject">
                        <Button
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleRejectBook(record.bookId)}
                            danger
                        />
                    </Tooltip>
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
        
        if (clone.bookName) filterArray.push(`${sfLike("bookName", clone.bookName)}`);
        if (clone.fullName) filterArray.push(`${sfLike("fullName", clone.fullName)}`);
        if (clone.categories) filterArray.push(`${sfLike("categories.name", clone.categories)}`);
        
        if (filterArray.length > 0) {
            q.filter = filterArray.join(" and ");
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.bookId) {
            sortBy = sort.bookId === 'ascend' ? "sort=bookId,asc" : "sort=bookId,desc";
        }
        if (sort && sort.bookName) {
            sortBy = sort.bookName === 'ascend' ? "sort=bookName,asc" : "sort=bookName,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }

        // Mặc định sort theo createdAt
        if (Object.keys(sort || {}).length === 0) {
            temp = `${temp}&sort=createdAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={
                    <div className="flex items-center">
                        <span>Pending list</span>
                        <Badge 
                            count={data.total} 
                            showZero
                            style={{ 
                                marginLeft: 8,
                                backgroundColor: data.total > 0 ? '#ff4d4f' : '#d9d9d9' 
                            }} 
                        />
                    </div>
                }
                rowKey="bookId"
                loading={isFetching}
                columns={columns}
                dataSource={books}
                request={async (params, sort, filter) => {
                    setIsFetching(true);
                    const query = buildQuery(params, sort, filter);
                    try {
                        const res = await callGetApproveBooks(query);
                        if (res && res.data) {
                            setBooks(res.data.result || []);
                            setData({
                                page: res.data.page,
                                pageSize: res.data.pageSize,
                                pages: res.data.totalPages,
                                total: res.data.totalElements
                            });
                            setIsFetching(false);
                        }
                        // setIsFetching(false);
                    } catch (error) {
                        console.error("Lỗi khi lấy danh sách sách:", error);
                        notification.error({
                            message: 'Có lỗi xảy ra',
                            description: 'Không thể lấy danh sách sách chờ duyệt'
                        });
                        // setIsFetching(true);
                    }
                }}
                scroll={{ x: true }}
                pagination={{
                    current: data.page,
                    pageSize: data.pageSize,
                    showSizeChanger: true,
                    total: data.total,
                    showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} mục</div>
                }}
                rowSelection={false}
            />
            
            <BookDetailModal
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                bookDetail={bookDetail}
                handleApproveBook={handleApproveBook}
                handleRejectBook={handleRejectBook}
            />
        </div>
    );
};

export default ApprovalBooksPage; 