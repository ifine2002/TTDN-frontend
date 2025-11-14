import DataTable from "components/client/data-table/index";
import { fetchBook } from "redux/slice/bookSlice";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteBook } from "api/services";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import ModalBook from "components/admin/book/modal.book";
import { IBook } from "@/types/backend";
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
  Record<"name" | "id" | "createdAt" | "updatedAt" | "createdBy", SortOrder>
>;

const BookPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState<IBook | null>(null);

  const actionRef = useRef<ActionType>();

  const dispatch = useAppDispatch();
  const isFetching = useAppSelector((state) => state.book.isFetching);
  const data = useAppSelector((state) => state.book.data || {});
  const books = useAppSelector((state) => state.book.result || []);

  const handleDeleteBook = async (id?: number) => {
    if (id) {
      const res = await callDeleteBook(id);
      if (+res.status === 200) {
        message.success("Xóa Book thành công");
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

  const columns: ProColumns<IBook>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      render: (text, record, index, action) => {
        return <span>{record.id}</span>;
      },
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Tên Sách",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },

    {
      title: "Thể loại",
      dataIndex: "categories",
      render: (categories) => {
        if (
          !categories ||
          !Array.isArray(categories) ||
          categories.length === 0
        )
          return "-";
        return categories.map((cat) => cat.name).join(", ");
      },
      fieldProps: {
        placeholder: "Tìm kiếm theo tên category",
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
      width: 200,
      sorter: true,
      render: (text, record) => {
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
      render: (text, record) => {
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
      render: (_value, entity) => (
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
            title={"Xác nhận xóa book"}
            description={"Bạn có chắc chắn muốn xóa sách này ?"}
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDeleteBook(entity?.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
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

    if (params.name) filterArray.push(`${sfLike("name", params.name)}`);
    if (params.description)
      filterArray.push(`${sfLike("description", params.description)}`);
    if (params.categories)
      filterArray.push(`${sfLike("categories.name", params.categories)}`);
    if (params.createdBy)
      filterArray.push(`${sfLike("createdBy", params.createdBy)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "id",
      "name",
      "createdBy",
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
        headerTitle="Danh sách cuốn sách"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={books}
        request={async (params: QueryParams, sort: Sorter) => {
          const query = buildQuery(params, sort);
          const res = await dispatch(fetchBook({ query })).unwrap();
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
        toolBarRender={() => [
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setOpenModal(true)}
          >
            Thêm mới
          </Button>,
        ]}
      />
      <ModalBook
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default BookPage;
