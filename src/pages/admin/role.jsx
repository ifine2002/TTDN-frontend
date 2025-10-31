import DataTable from "./../../components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { callDeleteRole, callFetchPermission } from "./../../api/services";
import queryString from "query-string";
import { fetchRole } from "./../../redux/slice/roleSlice";
import ModalRole from "./../../components/admin/role/modal.role";
import { sfLike } from "spring-filter-query-builder";
import { groupByPermission } from "./../../components/share/utils";

const RolePage = () => {
  const [openModal, setOpenModal] = useState(false);

  const tableRef = useRef();

  const isFetching = useAppSelector((state) => state.role.isFetching);
  const data = useAppSelector((state) => state.role.data);
  const roles = useAppSelector((state) => state.role.result);

  const dispatch = useAppDispatch();

  //all backend permissions
  const [listPermissions, setListPermissions] = useState(null);

  //current role
  const [singleRole, setSingleRole] = useState(null);

  useEffect(() => {
    const init = async () => {
      const res = await callFetchPermission(`page=0&size=100`);
      if (res.data?.result) {
        setListPermissions(groupByPermission(res.data?.result));
      }
    };
    init();
  }, []);

  const handleDeleteRole = async (id) => {
    if (id) {
      const res = await callDeleteRole(id);
      if (res && res.status === 200) {
        message.success("Xóa Role thành công");
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
      title: "Trạng thái",
      dataIndex: "isActive",
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tag color={entity.isActive ? "lime" : "red"}>
              {entity.isActive ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </>
        );
      },
      hideInSearch: true,
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
              setSingleRole(entity);
              setOpenModal(true);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa role"}
            description={"Bạn có chắc chắn muốn xóa role này ?"}
            onConfirm={() => handleDeleteRole(entity.id)}
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

    if (params.name) query.filter = `${sfLike("name", params.name)}`;

    if (!query.filter) delete query.filter;

    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields = ["name", "createdAt", "updatedAt", "id"];

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
        headerTitle="Danh sách Roles (Vai Trò)"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={roles}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchRole({ query }));
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
      <ModalRole
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        listPermissions={listPermissions}
        singleRole={singleRole}
        setSingleRole={setSingleRole}
      />
    </div>
  );
};

export default RolePage;
