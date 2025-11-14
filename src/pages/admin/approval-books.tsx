import { useState, useRef, useEffect } from "react";
import {
  Button,
  Space,
  message,
  notification,
  Badge,
  Tag,
  Image,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DataTable from "components/client/data-table/index";
import dayjs from "dayjs";
import { sfLike } from "spring-filter-query-builder";
import queryString from "query-string";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  callApproveBook,
  callRejectBook,
  callGetApproveBooks,
} from "api/services";
import BookDetailModal from "components/admin/book/modal.book-detail";
import { IBookAdmin } from "@/types/backend";

import { SortOrder } from "types/backend";

import type {
  ProColumns,
  ActionType,
  ParamsType,
} from "@ant-design/pro-components";

interface QueryParams extends ParamsType {
  current: number;
  pageSize: number;
  name?: string;
}

type Sorter = Partial<
  Record<"name" | "id" | "createdAt" | "createdBy", SortOrder>
>;

const ApprovalBooksPage = () => {
  const [realtimeItems, setRealtimeItems] = useState<IBookAdmin[]>([]);

  const [data, setData] = useState({
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [bookDetail, setBookDetail] = useState<IBookAdmin | null>(null);

  const actionRef = useRef<ActionType>();

  // Kết nối WebSocket
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe("/topic/admin-books", (message) => {
        const n = JSON.parse(message.body);
        if (n.action === "create") {
          const newBook: IBookAdmin = n.data;
          if (data.page === 1) {
            setRealtimeItems((prev) => {
              const has = prev.some((x) => x.bookId === newBook.bookId);
              return has
                ? prev.map((x) => (x.bookId === newBook.bookId ? newBook : x))
                : [newBook, ...prev];
            });
            setData((prev) => ({ ...prev, total: prev.total + 1 }));
            actionRef.current?.reload?.();
          } else {
            notification.info({
              message: "Sách mới",
              description: `Sách "${newBook.bookName}" vừa được đăng và đang chờ duyệt`,
            });
          }
        }
        if (n.action === "approve" || n.action === "reject") {
          reloadTable();
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [data.page]);

  // Xử lý duyệt sách
  const handleApproveBook = async (bookId: number) => {
    try {
      const res = await callApproveBook(bookId);
      if (res.status === 200) {
        message.success("Duyệt sách thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message || "Không thể duyệt sách",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể duyệt sách",
      });
    }
  };

  // Xử lý từ chối sách
  const handleRejectBook = async (bookId: number) => {
    try {
      const res = await callRejectBook(bookId);
      if (res.status === 200) {
        message.success("Từ chối sách thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message || "Không thể từ chối sách",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error.message || "Không thể từ chối sách",
      });
    }
  };

  // Xem chi tiết sách
  const handleViewDetail = (record: IBookAdmin) => {
    setBookDetail(record);
    setOpenViewDetail(true);
  };

  const reloadTable = () => {
    setRealtimeItems([]);
    actionRef?.current?.reload();
  };

  const columns: ProColumns<IBookAdmin>[] = [
    {
      title: "ID",
      dataIndex: "bookId",
      width: 50,
      render: (text) => text,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageBook",
      width: 100,
      render: (image) => <Image width={80} src={image as string} alt="book" />,
      hideInSearch: true,
    },
    {
      title: "Tên sách",
      dataIndex: "bookName",
      sorter: true,
      render: (text, record) => (
        <div>
          <div className="font-bold">{text}</div>
        </div>
      ),
    },
    {
      title: "Người đăng",
      dataIndex: "fullName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {record.avatar && (
            <Image
              width={40}
              height={35}
              src={record.avatar}
              alt="avatar"
              style={{ borderRadius: "50%", marginRight: "8px" }}
            />
          )}
          <span>{text}</span>
        </div>
      ),
      hideInSearch: true,
    },
    {
      title: "ID người dùng",
      dataIndex: "userId",
      render: (text) => text,
      hideInSearch: true,
    },
    {
      title: "Thể loại",
      dataIndex: "categories",
      render: (_, record) => {
        const categories = record.categories;
        if (!categories || categories.length === 0) return "-";
        return (
          <div style={{ maxWidth: "200px" }}>
            {categories.map((cat) => (
              <Tag key={cat.id} color="blue">
                {cat.name}
              </Tag>
            ))}
          </div>
        );
      },
      fieldProps: {
        placeholder: "Tìm kiếm theo thể loại",
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      fieldProps: {
        placeholder: "Tìm kiếm theo người tạo",
      },
      sorter: true,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      width: 180,
      sorter: true,
      render: (_, record) => {
        const text = record.createdAt;
        return text ? dayjs(text).format("DD-MM-YYYY HH:mm:ss") : "";
      },
      hideInSearch: true,
    },
    {
      title: "Hành động",
      hideInSearch: true,
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              type="default"
            />
          </Tooltip>
          <Tooltip title="Chấp thuận">
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveBook(record.bookId)}
              type="primary"
              style={{ backgroundColor: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
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

  const buildQuery = (params: QueryParams, sort: Sorter) => {
    const query: { page: number; size: number; filter?: string } = {
      page: params.current - 1,
      size: params.pageSize,
      filter: "",
    };

    const filterArray = [];
    if (params.bookName) filterArray.push(`${sfLike("name", params.bookName)}`);
    if (params.createdBy)
      filterArray.push(`${sfLike("createdBy", params.createdBy)}`);
    if (params.categories)
      filterArray.push(`${sfLike("categories.name", params.categories)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "id",
      "name",
      "createdBy",
      "createdAt",
    ];
    if (sort) {
      for (const field of fields) {
        if (sort[field]) {
          sortBy = `sort=${field},${sort[field] === "ascend" ? "asc" : "desc"}`;
          break; // Remove this if you want to handle multiple sort parameters
        }
      }
    }

    // Mặc định sort theo createdAt
    if (Object.keys(sort || {}).length === 0) {
      temp = `${temp}&sort=createdAt,desc`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <div>
      <DataTable
        actionRef={actionRef}
        headerTitle={
          <div className="flex items-center">
            <span>Danh sách cuốn sách chờ duyệt</span>
            <Badge
              count={data.total}
              showZero
              style={{
                marginLeft: 8,
                backgroundColor: data.total > 0 ? "#ff4d4f" : "#d9d9d9",
              }}
            />
          </div>
        }
        rowKey="bookId"
        columns={columns}
        request={async (
          params: QueryParams,
          sort: Sorter,
          filter: Record<string, unknown>
        ) => {
          try {
            // setIsFetching(true);
            const query = buildQuery(params, sort);
            const res = await callGetApproveBooks(query);

            if (res?.data) {
              setData({
                page: res.data.page,
                pageSize: res.data.pageSize,
                pages: res.data.totalPages,
                total: res.data.totalElements,
              });
            }

            return {
              data: (res?.data?.result as IBookAdmin[]) ?? [],
              success: true,
              total: res?.data?.totalElements ?? 0,
            };
          } catch (e) {
            notification.error({
              message: "Có lỗi xảy ra",
              description: "Không thể lấy danh sách sách chờ duyệt",
            });
            return {
              data: [],
              success: false,
              total: 0,
            };
          } finally {
            // setIsFetching(false);
          }
        }}
        postData={(serverData: IBookAdmin[]) => {
          const merged = [
            ...realtimeItems.filter(
              (r) => !serverData.some((s) => s.bookId === r.bookId)
            ),
            ...serverData,
          ];
          // optional: cắt theo pageSize để tránh “tràn” hàng trên trang 1
          return data.page === 1 ? merged.slice(0, data.pageSize) : serverData;
        }}
        scroll={{ x: true }}
        pagination={{
          current: data.page,
          pageSize: data.pageSize,
          showSizeChanger: true,
          total: data.total,
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} trên {total} mục
            </div>
          ),
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
