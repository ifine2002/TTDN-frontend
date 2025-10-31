import DataTable from "./../../components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { callDeleteRating } from "./../../api/services";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { fetchRating } from "../../redux/slice/ratingSlice";
import ModalRating from "../../components/admin/rating/modal.rating";

const RatingPage = () => {
  const [dataInit, setDataInit] = useState(null);
  const tableRef = useRef();

  const [openModal, setOpenModal] = useState(false);
  const isFetching = useAppSelector((state) => state.rating.isFetching);
  const data = useAppSelector((state) => state.rating.data);
  const ratings = useAppSelector((state) => state.rating.result);

  const dispatch = useAppDispatch();

  const handleDeleteRating = async (id) => {
    if (id) {
      const res = await callDeleteRating(id);
      if (res && res.status === 200) {
        message.success("Xóa Follow thành công");
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
      sorter: true,
      render: (text, record, index, action) => {
        return <span>{record.id}</span>;
      },
    },
    {
      title: "Stars",
      dataIndex: "stars",
      sorter: true,
    },
    {
      title: "User Id",
      dataIndex: "userId",
      sorter: true,
    },
    {
      title: "Book Id",
      dataIndex: "bookId",
      sorter: true,
      // fieldProps: {
      //     placeholder: 'Tìm kiếm theo Following Id',
      //     style: { marginLeft: 5 }
      // },
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
            title={"Xác nhận xóa rating"}
            description={"Bạn có chắc chắn muốn xóa rating này ?"}
            onConfirm={() => handleDeleteRating(entity.id)}
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

    if (params.id) filterArray.push(`${sfLike("id", params.id)}`);
    if (params.stars) filterArray.push(`${sfLike("stars", params.stars)}`);
    if (params.userId) filterArray.push(`${sfLike("user.id", params.userId)}`);
    if (params.bookId) filterArray.push(`${sfLike("book.id", params.bookId)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields = [
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
        actionRef={tableRef}
        headerTitle="Danh sách Rating"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={ratings}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchRating({ query }));
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
