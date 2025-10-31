import DataTable from "./../../components/client/data-table/index";
import { fetchUser } from "./../../redux/slice/userSlice";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteUser, callFetchUserDetail } from "./../../api/services";
import queryString from "query-string";
import ViewDetailUser from "./../../components/admin/user/view.user";
import { sfLike } from "spring-filter-query-builder";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import ModalUser from "../../components/admin/user/modal.user";

const UserPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const tableRef = useRef();

  const dispatch = useAppDispatch();
  const isFetching = useAppSelector((state) => state.user.isFetching);
  const data = useAppSelector((state) => state.user.data || {});
  const users = useAppSelector((state) => state.user.result || []);

  const handleDeleteUser = async (id) => {
    if (id) {
      const res = await callDeleteUser(id);
      if (+res.status === 200) {
        message.success("Xóa User thành công");
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

  const handleViewDetail = async (record) => {
    const res = await callFetchUserDetail(record.id);
    setUserDetail(res.data);
    setOpenViewDetail(true);
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
      dataIndex: "fullName",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },

    {
      title: "Role",
      dataIndex: ["role", "name"],
      hideInSearch: true,
    },

    {
      title: "CreatedAt",
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
      title: "UpdatedAt",
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
      title: "Actions",
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
            title={"Xác nhận xóa user"}
            description={"Bạn có chắc chắn muốn xóa user này ?"}
            onConfirm={(e) => {
              e.stopPropagation();
              handleDeleteUser(entity.id);
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
    if (params.fullName)
      filterArray.push(`${sfLike("fullName", params.fullName)}`);
    if (params.email) filterArray.push(`${sfLike("email", params.email)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields = ["fullName", "email", "id", "createdAt", "updatedAt"];

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
        headerTitle="Danh sách Users"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={users}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchUser({ query }));
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
              if (!event.target.closest(".ant-space")) {
                handleViewDetail(record);
              }
            },
            style: { cursor: "pointer" },
          };
        }}
      />
      <ModalUser
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
      <ViewDetailUser
        onClose={() => setOpenViewDetail(false)}
        open={openViewDetail}
        userDetail={userDetail}
        setUserDetail={setUserDetail}
      />
    </div>
  );
};

export default UserPage;
