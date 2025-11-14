import DataTable from "components/client/data-table";
import { fetchUser } from "redux/slice/userSlice";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteUser, callFetchUserDetail } from "api/services";
import queryString from "query-string";
import ViewDetailUser from "components/admin/user/view.user";
import { sfLike } from "spring-filter-query-builder";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import ModalUser from "components/admin/user/modal.user";
import { IUser, IUserDetail, SortOrder } from "@/types/backend";

import type {
  ProColumns,
  ActionType,
  ParamsType,
} from "@ant-design/pro-components";

type Sorter = Partial<
  Record<"fullName" | "email" | "id" | "createdAt" | "updatedAt", SortOrder>
>;

interface QueryParams extends ParamsType {
  current: number;
  pageSize: number;
  fullName?: string;
  email?: string;
}

const UserPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IUser | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [userDetail, setUserDetail] = useState<IUserDetail | null>(null);

  const actionRef = useRef<ActionType>();

  const dispatch = useAppDispatch();
  const isFetching = useAppSelector((state) => state.user.isFetching);
  const data = useAppSelector((state) => state.user.data || {}); // page, pageSize, total...
  // const users = useAppSelector((state) => state.user.result || []); // KHÔNG dùng khi đã có request

  const handleDeleteUser = async (id?: number) => {
    if (!id) return;
    const res = await callDeleteUser(id);
    if (+res.status === 200) {
      message.success("Xóa User thành công");
      actionRef.current?.reload();
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
  };

  const handleViewDetail = async (record: IUser) => {
    const res = await callFetchUserDetail(record.id!);
    if (res && res.data) {
      setUserDetail(res.data);
      setOpenViewDetail(true);
    }
  };

  const columns: ProColumns<IUser>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (_, record) => <span>{record.id}</span>,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Tên hiển thị",
      dataIndex: "fullName",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "name"],
      hideInSearch: true,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (_, record) =>
        record.createdAt
          ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
          : "",
      hideInSearch: true,
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (_, record) =>
        record.updatedAt
          ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
          : "",
      hideInSearch: true,
    },
    {
      title: "Hành động",
      valueType: "option",
      hideInSearch: true,
      width: 100,
      render: (_, entity) => [
        <Space key="actions">
          <EditOutlined
            style={{ fontSize: 20, color: "#ffa500" }}
            onClick={() => {
              setOpenModal(true);
              setDataInit(entity);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa user"}
            description={"Bạn có chắc chắn muốn xóa user này ?"}
            onConfirm={(e?: React.MouseEvent<HTMLElement>) => {
              e?.stopPropagation();
              handleDeleteUser(entity.id);
            }}
            onCancel={(e?: React.MouseEvent<HTMLElement>) =>
              e?.stopPropagation()
            }
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <span
              style={{ cursor: "pointer", margin: "0 10px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
            </span>
          </Popconfirm>
        </Space>,
      ],
    },
  ];

  const buildQuery = (params: QueryParams, sort: Sorter) => {
    const query: { page: number; size: number; filter?: string } = {
      page: params.current - 1,
      size: params.pageSize,
      filter: "",
    };

    const filterArray: string[] = [];
    if (params.fullName)
      filterArray.push(`${sfLike("fullName", params.fullName)}`);
    if (params.email) filterArray.push(`${sfLike("email", params.email)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "fullName",
      "email",
      "id",
      "createdAt",
      "updatedAt",
    ];

    if (sort) {
      for (const field of fields) {
        if (sort[field]) {
          sortBy = `sort=${field},${sort[field] === "ascend" ? "asc" : "desc"}`;
          break;
        }
      }
    }

    // mặc định sort theo updatedAt
    if (!sortBy) {
      temp = `${temp}&sort=updatedAt,desc`;
    } else {
      temp = `${temp}&${sortBy}`;
    }

    return temp;
  };

  return (
    <div>
      <DataTable<IUser, QueryParams>
        actionRef={actionRef}
        headerTitle="Danh sách người dùng"
        rowKey="id"
        bordered
        loading={isFetching}
        columns={columns}
        request={async (params, sort) => {
          const query = buildQuery(params as QueryParams, sort as Sorter);
          const res = await dispatch(fetchUser({ query })).unwrap();
          return {
            data: res?.data?.result ?? [],
            success: true,
            total: res?.data?.totalElements,
          };
        }}
        // KHÔNG truyền dataSource khi đã dùng request
        scroll={{ x: true }}
        pagination={{
          // giá trị mặc định cho lần đầu (ProTable sẽ cập nhật theo request)
          current: data.page,
          pageSize: data.pageSize,
          showSizeChanger: true,
          total: data.total,
          showTotal: (total, range) => (
            <div>
              {" "}
              {range[0]}-{range[1]} trên {total} mục
            </div>
          ),
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
        onRow={(record) => {
          return {
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              if (!(event.target as HTMLElement).closest(".ant-space")) {
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
        reloadTable={() => actionRef.current?.reload()}
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
