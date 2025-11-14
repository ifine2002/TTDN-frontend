import DataTable from "components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { callDeleteComment } from "api/services";
import queryString from "query-string";
import { sfEqual, sfLike } from "spring-filter-query-builder";
import { fetchComment } from "redux/slice/commentSlice";
import ModalComment from "components/admin/comment/modal.comment";
import { IComment, SortOrder } from "types/backend";

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
  Record<"userId" | "id" | "bookId" | "createdAt" | "updatedAt", SortOrder>
>;

const CommentPage = () => {
  const [dataInit, setDataInit] = useState<IComment | null>(null);
  const actionRef = useRef<ActionType>();

  const [openModal, setOpenModal] = useState(false);
  const isFetching = useAppSelector((state) => state.comment.isFetching);
  const data = useAppSelector((state) => state.comment.data);

  const dispatch = useAppDispatch();

  const handleDeleteComment = async (id: number) => {
    if (id) {
      const res = await callDeleteComment(id);
      if (res && res.status === 200) {
        message.success("Xóa bình luận thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    actionRef?.current?.reload();
  };

  const columns: ProColumns<IComment>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      sorter: true,
      render: (text, record, index, action) => {
        return <span>{record.id}</span>;
      },
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
    },
    {
      title: "IsReview",
      dataIndex: "ratingComment",
      render: (text, record) => {
        return (
          <>
            {record.ratingComment !== undefined
              ? record.ratingComment
                ? "True"
                : "False"
              : ""}
          </>
        );
      },
      valueType: "select",
      valueEnum: {
        true: {
          text: "true",
        },
        false: {
          text: "false",
        },
      },
    },
    {
      title: "User ID",
      dataIndex: "userId",
      sorter: true,
    },
    {
      title: "Book ID",
      dataIndex: "bookId",
      sorter: true,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.updatedAt
              ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Hành động",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <EditOutlined
            style={{
              fontSize: 20,
              color: "#ffa500",
            }}
            type=""
            onClick={() => {
              setOpenModal(true);
              setDataInit(entity);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa bình luận"}
            description={"Bạn có chắc chắn muốn xóa bình luận này ?"}
            onConfirm={() => handleDeleteComment(entity.id!)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <span style={{ cursor: "pointer", margin: "0 10px" }}>
              <DeleteOutlined
                style={{
                  fontSize: 20,
                  color: "#ff4d4f",
                }}
              />
            </span>
          </Popconfirm>
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
    if (params.ratingComment === "true" || params.ratingComment === "false") {
      filterArray.push(sfEqual("isRatingComment", params.ratingComment));
    }
    if (params.id) filterArray.push(`${sfLike("id", params.id)}`);
    if (params.comment)
      filterArray.push(`${sfLike("comment", params.comment)}`);
    if (params.userId) filterArray.push(`${sfLike("user.id", params.userId)}`);
    if (params.bookId) filterArray.push(`${sfLike("book.id", params.bookId)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "userId",
      "bookId",
      "id",
      "createdAt",
      "updatedAt",
    ];

    if (sort) {
      for (const field of fields) {
        if (sort[field]) {
          sortBy = `sort=${field},${sort[field] === "ascend" ? "asc" : "desc"}`;
          break; // Remove this if you want to handle multiple sort parameters
        }
      }
    }

    if (Object.keys(sortBy).length === 0) {
      temp = `${temp}&sort=updatedAt,desc`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };
  return (
    <div>
      <DataTable
        actionRef={actionRef}
        headerTitle="Danh sách bình luận"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        request={async (params, sort) => {
          const query = buildQuery(params as QueryParams, sort as Sorter);
          const res = await dispatch(fetchComment({ query })).unwrap();
          return {
            data: res?.data?.result ?? [],
            success: true,
            total: res?.data?.totalElements,
          };
        }}
        scroll={{ x: true }}
        pagination={{
          current: data.page,
          pageSize: data.pageSize,
          showSizeChanger: true,
          total: data.total,
          showTotal: (total, range) => {
            return (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} mục
              </div>
            );
          },
        }}
        rowSelection={false}
        toolBarRender={(_action, _rows) => [
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Thêm mới
          </Button>,
        ]}
      />
      <ModalComment
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default CommentPage;
