import React from 'react';
import { Layout, Menu, Avatar } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  CompassOutlined,
  PlusCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import '../../../styles/sidebar.scss';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  // Xác định mục menu active dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const pathname = location.pathname;

    if (pathname === '/') return 'home';
    if (pathname === '/search') return 'search';
    if (pathname === '/explore') return 'explore';
    if (pathname === '/create') return 'create';
    if (pathname === '/my-profile') return 'my-profile';

    return '';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: <Link to="/search">Tìm kiếm</Link>,
    },
    {
      key: 'explore',
      icon: <CompassOutlined />,
      label: <Link to="/explore">Khám phá</Link>,
    },
    ...(isAuthenticated === true ? [{
      key: 'create',
      label: <Link to="/create">Tạo</Link>,
      icon: <PlusCircleOutlined />,
    }] : []),
    ...(isAuthenticated === true ? [{
      key: 'my-profile',
      icon: <Avatar size={24} icon={<UserOutlined />} />,
      label: <Link to="/my-profile">Trang cá nhân</Link>,
    }] : []),
  ];

  return (
    <Sider
      width={240}
      className="sidebar"
      theme="light"
    >
      {/* <div className="logo">
        <h1><Link to="/">Goodreads</Link></h1>
      </div> */}
      <Menu
        mode="vertical"
        className="sidebar-menu"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
