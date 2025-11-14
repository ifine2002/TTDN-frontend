import DataTable from "components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { callDeleteRating } from "api/services";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { fetchRating } from "redux/slice/ratingSlice";
import ModalRating from "components/admin/rating/modal.rating";
import { IRating, SortOrder } from "types/backend";

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
  Record<
    "userId" | "id" | "bookId" | "stars" | "createdAt" | "updatedAt",
    SortOrder
  >
>;

const RatingPage = () => {
  const [dataInit, setDataInit] = useState<IRating | null>(null);
  const actionRef = useRef<ActionType>();

  const [openModal, setOpenModal] = useState(false);
  const isFetching = useAppSelector((state) => state.rating.isFetching);
  const data = useAppSelector((state) => state.rating.data);

  const dispatch = useAppDispatch();

  const handleDeleteRating = async (id: number) => {
    if (id) {
      const res = await callDeleteRating(id);
      if (res && res.status === 200) {
        message.success("Xóa đánh giá thành công");
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

  const columns: ProColumns<IRating>[] = [
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
      title: "Số sao",
      dataIndex: "stars",
      sorter: true,
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
      // fieldProps: {
      //     placeholder: 'Tìm kiếm theo Following Id',
      //     style: { marginLeft: 5 }
      // },
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
            title={"Xác nhận xóa đánh giá"}
            description={"Bạn có chắc chắn muốn xóa đánh giá này ?"}
            onConfirm={() => handleDeleteRating(entity.id!)}
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

    if (params.id) filterArray.push(`${sfLike("id", params.id)}`);
    if (params.stars) filterArray.push(`${sfLike("stars", params.stars)}`);
    if (params.userId) filterArray.push(`${sfLike("user.id", params.userId)}`);
    if (params.bookId) filterArray.push(`${sfLike("book.id", params.bookId)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "id",
      "stars",
      "userId",
      "bookId",
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

    //mặc định sort theo updatedAt
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
        headerTitle="Danh sách đánh giá"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        request={async (params, sort) => {
          const query = buildQuery(params as QueryParams, sort as Sorter);
          const res = await dispatch(fetchRating({ query })).unwrap();
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
      <ModalRating
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default RatingPage;
