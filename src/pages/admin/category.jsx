import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteCategory } from "./../../api/services";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { fetchCategory } from "../../redux/slice/categorySlice";
import ModalCategory from "./../../components/admin/category/modal.category";

const CategoryPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);

  const tableRef = useRef();

  const isFetching = useAppSelector((state) => state.category.isFetching);
  const data = useAppSelector((state) => state.category.data);
  const categories = useAppSelector((state) => state.category.result);
  const dispatch = useAppDispatch();

  const handleDeleteCategory = async (id) => {
    if (id) {
      const res = await callDeleteCategory(id);
      if (res && +res.status === 200) {
        message.success("Xóa Category thành công");
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
    tableRef?.current?.reload();
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      width: 50,
      render: (text, record, index, action) => {
        return <span>{record.id}</span>;
      },
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },

    {
      title: "Description",
      dataIndex: "description",
      // hideInSearch: true,
    },

    {
      title: "CreatedAt",
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
      title: "UpdatedAt",
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
      title: "Actions",
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
            title={"Xác nhận xóa category"}
            description={"Bạn có chắc chắn muốn xóa category này ?"}
            onConfirm={() => handleDeleteCategory(entity.id)}
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

  const buildQuery = (params, sort, filter) => {
    const query = {
      page: params.current - 1,
      size: params.pageSize,
      filter: "",
    };

    let filterArray = [];
    if (params.name) filterArray.push(`${sfLike("name", params.name)}`);
    if (params.description)
      filterArray.push(`${sfLike("description", params.description)}`);

    query.filter = filterArray.join(" and ");
    if (!query.filter) delete query.filter;

    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields = ["id", "name", "createdAt", "updatedAt"];

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
        actionRef={tableRef}
        headerTitle="Danh sách Category"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={categories}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchCategory({ query }));
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
                {range[0]}-{range[1]} trên {total} rows
              </div>
            );
          },
        }}
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
      <ModalCategory
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default CategoryPage;
