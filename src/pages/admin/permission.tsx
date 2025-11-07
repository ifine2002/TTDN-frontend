import DataTable from "components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeletePermission } from "api/services";
import queryString from "query-string";
import { fetchPermission } from "redux/slice/permissionSlice";
import ViewDetailPermission from "components/admin/permission/view.permission";
import { colorMethod } from "components/share/utils";
import ModalPermission from "components/admin/permission/modal.permission";
import { sfLike } from "spring-filter-query-builder";

import type {
  ProColumns,
  ActionType,
  ParamsType,
} from "@ant-design/pro-components";
import { IPermission, SortOrder } from "@/types/backend";

interface QueryParams extends ParamsType {
  current: number;
  pageSize: number;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
}

type Sorter = Partial<
  Record<
    "name" | "apiPath" | "method" | "module" | "createdAt" | "updatedAt",
    SortOrder
  >
>;

const PermissionPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState<IPermission | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState(false);

  const actionRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.permission.isFetching);
  const data = useAppSelector((state) => state.permission.data);
  const dispatch = useAppDispatch();

  const handleDeletePermission = async (id: number) => {
    if (id) {
      const res = await callDeletePermission(id);
      if (res && res.status === 200) {
        message.success("Xóa Permission thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error,
        });
      }
    }
  };

  const reloadTable = () => {
    actionRef?.current?.reload();
  };

  const columns: ProColumns<IPermission>[] = [
    {
      title: "Id",
      dataIndex: "id",
      width: 50,
      render: (text, record, index, action) => {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(record);
            }}
          >
            {record.id}
          </a>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "API",
      dataIndex: "apiPath",
      sorter: true,
    },
    {
      title: "Method",
      dataIndex: "method",
      sorter: true,
      render(dom, entity, index, action, schema) {
        return (
          <p
            style={{
              paddingLeft: 10,
              fontWeight: "bold",
              marginBottom: 0,
              color: colorMethod(entity?.method as string),
            }}
          >
            {entity?.method || ""}
          </p>
        );
      },
    },
    {
      title: "Module",
      dataIndex: "module",
      sorter: true,
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
            title={"Xác nhận xóa permission"}
            description={"Bạn có chắc chắn muốn xóa permission này ?"}
            onConfirm={() => handleDeletePermission(entity.id!)}
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

    if (params.name) filterArray.push(`${sfLike("name", params.name)}`);
    if (params.apiPath)
      filterArray.push(`${sfLike("apiPath", params.apiPath)}`);
    if (params.method) filterArray.push(`${sfLike("method", params.method)}`);
    if (params.module) filterArray.push(`${sfLike("module", params.module)}`);

    query.filter = filterArray.join(" and ");
    if (!query.filter) delete query.filter;

    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields: Array<keyof Sorter> = [
      "name",
      "apiPath",
      "method",
      "module",
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
        headerTitle="Danh sách Permissions (Quyền Hạn)"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        request={async (params, sort) => {
          const query = buildQuery(params as QueryParams, sort as Sorter);
          const res = await dispatch(fetchPermission({ query })).unwrap();
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
                {range[0]}-{range[1]} trên {total} rows
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
      <ModalPermission
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />

      <ViewDetailPermission
        onClose={setOpenViewDetail}
        open={openViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default PermissionPage;
