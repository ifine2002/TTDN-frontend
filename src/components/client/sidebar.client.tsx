import { Layout, Menu, Avatar } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  CompassOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "styles/sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "redux/hooks";
import { useState, useEffect } from "react";

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Xác định mục menu active dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const pathname = location.pathname;

    if (pathname === "/") return "home";
    if (pathname === "/search") return "search";
    if (pathname === "/explore") return "explore";
    if (pathname === "/create") return "create";
    if (pathname === "/my-profile") return "my-profile";

    return "";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "search",
      icon: <SearchOutlined />,
      label: <Link to="/search">Tìm kiếm</Link>,
    },
    {
      key: "explore",
      icon: <CompassOutlined />,
      label: <Link to="/explore">Khám phá</Link>,
    },
    ...(isAuthenticated === true
      ? [
          {
            key: "create",
            label: <Link to="/create">Tạo</Link>,
            icon: <PlusCircleOutlined />,
          },
        ]
      : []),
    ...(isAuthenticated === true
      ? [
          {
            key: "my-profile",
            icon: <Avatar size={24} icon={<UserOutlined />} />,
            label: <Link to="/my-profile">Trang cá nhân</Link>,
          },
        ]
      : []),
  ];

  // Nếu là mobile (< 576px), render menu bottom chỉ hiển thị icon
  if (isMobile) {
    const mobileMenuItems = [
      {
        key: "home",
        icon: <Link to="/"><HomeOutlined /></Link>,
      },
      {
        key: "search",
        icon: <Link to="/search"><SearchOutlined /></Link>,
      },
      {
        key: "explore",
        icon: <Link to="/explore"><CompassOutlined /></Link>,
      },
      ...(isAuthenticated === true
        ? [
            {
              key: "create",
              icon: <Link to="/create"><PlusCircleOutlined /></Link>,
            },
          ]
        : []),
      ...(isAuthenticated === true
        ? [
            {
              key: "my-profile",
              icon: <Link to="/my-profile"><Avatar size={24} icon={<UserOutlined />} /></Link>,
            },
          ]
        : []),
    ];

    return (
      <div className="sidebar-mobile">
        <Menu
          mode="horizontal"
          className="sidebar-menu-mobile"
          selectedKeys={[getSelectedKey()]}
          items={mobileMenuItems}
        />
      </div>
    );
  }

  return (
    <Sider
      width={isTablet ? 80 : 240}
      className={`sidebar ${isTablet ? "sidebar-collapsed" : ""}`}
      theme="light"
      collapsed={isTablet}
      collapsedWidth={80}
    >
      <Menu
        mode="vertical"
        className="sidebar-menu"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        inlineCollapsed={isTablet}
      />
    </Sider>
  );
};

export default Sidebar;
