import DataTable from "./../../components/client/data-table/index";
import { useAppDispatch, useAppSelector } from "./../../redux/hooks";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { callDeleteFollow } from "./../../api/services";
import queryString from "query-string";
import { fetchFollow } from "./../../redux/slice/followSlice";
import { sfLike } from "spring-filter-query-builder";
import ModalFollow from "../../components/admin/follow/modal.follow";

const FollowPage = () => {
  const tableRef = useRef();
  const [openModal, setOpenModal] = useState(false);
  const isFetching = useAppSelector((state) => state.follow.follows.isFetching);
  const data = useAppSelector((state) => state.follow.follows.data);
  const follows = useAppSelector((state) => state.follow.follows.result);

  const dispatch = useAppDispatch();

  const handleDeleteFollow = async (id) => {
    if (id) {
      const res = await callDeleteFollow(id);
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
      title: "Follower Id",
      dataIndex: "followerId",
      sorter: true,
    },
    {
      title: "Following  Id",
      dataIndex: "followingId",
      sorter: true,
      fieldProps: {
        placeholder: "Tìm kiếm theo Following Id",
        style: { marginLeft: 5 },
      },
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
      title: "CreatedBy",
      dataIndex: "createdBy",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "Actions",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa follow"}
            description={"Bạn có chắc chắn muốn xóa follow này ?"}
            onConfirm={() => handleDeleteFollow(entity.id)}
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
    if (params.followerId)
      filterArray.push(`${sfLike("follower.id", params.followerId)}`);
    if (params.followingId)
      filterArray.push(`${sfLike("following.id", params.followingId)}`);
    if (params.createdBy)
      filterArray.push(`${sfLike("createdBy", params.createdBy)}`);
    query.filter = filterArray.join(" and ");

    if (!query.filter) delete query.filter;
    let temp = queryString.stringify(query);

    let sortBy = "";
    const fields = [
      "followerId",
      "followingId",
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
        headerTitle="Danh sách Follow"
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={follows}
        request={async (params, sort, filter) => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchFollow({ query }));
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
      <ModalFollow
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
      />
    </div>
  );
};

export default FollowPage;
