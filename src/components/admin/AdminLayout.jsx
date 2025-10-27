import React, { useState, useEffect, useMemo } from "react";
import {
  AppstoreOutlined,
  ExceptionOutlined,
  ApiOutlined,
  UserOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BugOutlined,
  UserAddOutlined,
  BookOutlined,
  LikeOutlined,
  CommentOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Space,
  message,
  Avatar,
  Button,
  Badge,
  Spin,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { callLogout } from "./../../api/services";
import { setLogoutAction } from "./../../redux/slice/accountSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { ALL_PERMISSIONS } from "../../utils/permission";
import Forbidden from "../../components/share/forbidden";

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [pendingBooks, setPendingBooks] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const user = useAppSelector((state) => state.account.user);
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);

  const permissions = useAppSelector(
    (state) => state.account.user?.role?.permissions || []
  );
  const [menuItems, setMenuItems] = useState([]);

  // Kiểm tra permissions ngay từ đầu
  // const hasAdminPermissions = useMemo(() => {
  //   const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;

  //   if (permissions?.length || ACL_ENABLE === "false") {
  //     const viewRating = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.RATINGS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.RATINGS.GET_PAGINATE.method
  //     );

  //     const viewComment = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.COMMENTS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.COMMENTS.GET_PAGINATE.method
  //     );

  //     const viewPermission = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.method
  //     );

  //     const viewCategory = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.method
  //     );

  //     const viewRole = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
  //     );

  //     const viewUser = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
  //     );

  //     const viewFollow = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.FOLLOWS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.FOLLOWS.GET_PAGINATE.method
  //     );

  //     const viewBook = permissions?.find(
  //       (item) =>
  //         item.apiPath === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.method
  //     );

  //     const viewApprovedBook = permissions?.find(
  //       (item) =>
  //         item.apiPath ===
  //           ALL_PERMISSIONS.APPROVED_BOOKS.GET_PAGINATE.apiPath &&
  //         item.method === ALL_PERMISSIONS.APPROVED_BOOKS.GET_PAGINATE.method
  //     );

  //     return (
  //       viewRating ||
  //       viewComment ||
  //       viewPermission ||
  //       viewCategory ||
  //       viewRole ||
  //       viewUser ||
  //       viewFollow ||
  //       viewBook ||
  //       viewApprovedBook ||
  //       ACL_ENABLE === "false"
  //     );
  //   }

  //   return false;
  // }, [permissions]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  // Kết nối WebSocket để cập nhật số sách đang chờ duyệt
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      // console.log('AdminLayout connected to WebSocket');

      // Đăng ký nhận thông báo khi có sách mới
      client.subscribe("/topic/admin-books", (message) => {
        try {
          const notification = JSON.parse(message.body);
          // console.log('AdminLayout received notification:', notification);

          const action = notification.action;
          if (action === "create") {
            // Tăng số lượng sách chờ duyệt
            setPendingBooks((prevCount) => prevCount + 1);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // Khi chuyển đến trang duyệt sách, đặt lại số lượng sách đang chờ duyệt
  useEffect(() => {
    if (location.pathname === "/admin/approval-books") {
      setPendingBooks(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Tạo menu items dựa trên permissions
  useEffect(() => {
    if (permissions?.length) {
      const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;

      const viewRating = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.RATINGS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.RATINGS.GET_PAGINATE.method
      );

      const viewComment = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.COMMENTS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.COMMENTS.GET_PAGINATE.method
      );

      const viewPermission = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.method
      );

      const viewCategory = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.method
      );

      const viewRole = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
      );

      const viewUser = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const viewFollow = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.FOLLOWS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.FOLLOWS.GET_PAGINATE.method
      );

      const viewBook = permissions?.find(
        (item) =>
          item.apiPath === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.method
      );

      const viewApprovedBook = permissions?.find(
        (item) =>
          item.apiPath ===
            ALL_PERMISSIONS.APPROVED_BOOKS.GET_PAGINATE.apiPath &&
          item.method === ALL_PERMISSIONS.APPROVED_BOOKS.GET_PAGINATE.method
      );

      const hasAnyViewPermission =
        viewRating ||
        viewComment ||
        viewPermission ||
        viewCategory ||
        viewRole ||
        viewUser ||
        viewFollow ||
        viewBook ||
        viewApprovedBook ||
        ACL_ENABLE === "false";

      if (!hasAnyViewPermission) {
        setHasAdminPermissions(true);
        return;
      }

      const full = [
        {
          label: <Link to="/admin">Dashboard</Link>,
          key: "/admin",
          icon: <AppstoreOutlined />,
        },
        ...(viewRating || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/rating">Rating</Link>,
                key: "/admin/rating",
                icon: <LikeOutlined />,
              },
            ]
          : []),

        ...(viewComment || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/comment">Comment</Link>,
                key: "/admin/comment",
                icon: <CommentOutlined />,
              },
            ]
          : []),

        ...(viewPermission || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/permission">Permission</Link>,
                key: "/admin/permission",
                icon: <ApiOutlined />,
              },
            ]
          : []),

        ...(viewCategory || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/category">Category</Link>,
                key: "/admin/category",
                icon: <BookOutlined />,
              },
            ]
          : []),

        ...(viewRole || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/role">Role</Link>,
                key: "/admin/role",
                icon: <ExceptionOutlined />,
              },
            ]
          : []),

        ...(viewUser || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/user">User</Link>,
                key: "/admin/user",
                icon: <UserOutlined />,
              },
            ]
          : []),

        ...(viewFollow || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/follow">Follow</Link>,
                key: "/admin/follow",
                icon: <UserAddOutlined />,
              },
            ]
          : []),

        ...(viewBook || ACL_ENABLE === "false"
          ? [
              {
                label: <Link to="/admin/book">Book</Link>,
                key: "/admin/book",
                icon: <BankOutlined />,
              },
            ]
          : []),

        ...(viewApprovedBook || ACL_ENABLE === "false"
          ? [
              {
                label: (
                  <Link to="/admin/approval-books">
                    <Space>
                      Approval Books
                      {pendingBooks > 0 && (
                        <Badge
                          count={pendingBooks}
                          style={{ backgroundColor: "#f5222d" }}
                        />
                      )}
                    </Space>
                  </Link>
                ),
                key: "/admin/approval-books",
                icon: <AuditOutlined />,
              },
            ]
          : []),
      ];

      setMenuItems(full);
    }
  }, [pendingBooks, permissions]);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && res.status === 200) {
      localStorage.removeItem("access_token");
      dispatch(setLogoutAction({}));
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  const itemsDropdown = [
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <>
      {hasAdminPermissions ? (
        <Forbidden />
      ) : (
        <Layout
          style={{ minHeight: "100vh", width: "100%", overflowX: "hidden" }}
          className="layout-admin"
        >
          {!isMobile ? (
            <Sider
              theme="light"
              collapsible
              collapsed={collapsed}
              onCollapse={(value) => setCollapsed(value)}
            >
              <div style={{ height: 32, margin: 16, textAlign: "center" }}>
                <BugOutlined /> ADMIN
              </div>
              <Menu
                selectedKeys={[activeMenu]}
                mode="inline"
                items={menuItems}
                onClick={(e) => setActiveMenu(e.key)}
              />
            </Sider>
          ) : (
            <Menu
              selectedKeys={[activeMenu]}
              items={menuItems}
              onClick={(e) => setActiveMenu(e.key)}
              mode="horizontal"
            />
          )}

          <Layout style={{ overflow: "hidden" }}>
            {!isMobile && (
              <div
                className="admin-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginRight: 20,
                }}
              >
                <Button
                  type="text"
                  icon={
                    collapsed
                      ? React.createElement(MenuUnfoldOutlined)
                      : React.createElement(MenuFoldOutlined)
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                  }}
                />

                <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
                  <Space style={{ cursor: "pointer" }}>
                    Welcome {user?.fullName || "User"}
                    <Avatar> {user?.fullName?.charAt(0) || "U"} </Avatar>
                  </Space>
                </Dropdown>
              </div>
            )}
            <Content style={{ padding: "15px", overflow: "auto" }}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      )}
    </>
  );
};

export default LayoutAdmin;
