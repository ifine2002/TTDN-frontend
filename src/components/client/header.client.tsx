import { useState, useEffect, useRef } from "react";
import {
  ContactsOutlined,
  FireOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Drawer,
  Dropdown,
  Space,
  message,
  Input,
  Menu,
  List,
  Card,
  Spin,
  Empty,
  Button,
  Popover,
} from "antd";
import { isMobile } from "react-device-detect";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { callLogout, callSearchHomeBook } from "api/services";
import { setLogoutAction } from "redux/slice/accountSlice";
import "styles/header.scss";
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from "rxjs/operators";
import type { MenuInfo } from "rc-menu/lib/interface";
import { IBookSearch } from "@/types/backend";

const { Search } = Input;

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchSubject = useRef<Subject<string>>(new Subject());

  // App state
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const user = useAppSelector((state) => state.account.user);

  // Component state
  const [current, setCurrent] = useState("home");
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IBookSearch[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const pageSize = 5;

  // Effects
  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setPopoverVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // RxJS search subscription
  useEffect(() => {
    const subscription = searchSubject.current
      .pipe(
        // Bỏ qua các giá trị không cần thiết
        filter((value) => typeof value === "string"),
        // Loại bỏ các giá trị trùng lặp
        distinctUntilChanged(),
        // Đợi 500ms trước khi thực hiện tìm kiếm
        debounceTime(500),
        // Lọc các giá trị rỗng hoặc quá ngắn
        filter((value) => value.trim().length >= 2),
        // Chuyển đổi query thành API call và hủy các request cũ nếu có query mới
        switchMap(async (value) => {
          setLoading(true);
          setPopoverVisible(true);
          const query = `page=0&size=${pageSize}&keyword=${encodeURIComponent(
            value.trim()
          )}`;
          return await callSearchHomeBook(query);
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.data) {
            console.log(">>> check res: ", res);
            setSearchResults(res.data.result || []);
            setTotalItems(res.data.totalElements || 0);
          }
          setLoading(false);
        },
        error: (err) => {
          console.error("Lỗi khi tìm kiếm sách:", err);
          setLoading(false);
        },
      });

    // Cleanup subscription khi component unmount
    return () => subscription.unsubscribe();
  }, []);

  // Event handlers
  const handleMenuClick = (e: MenuInfo) => {
    setCurrent(e.key);
  };

  const handleLogout = async () => {
    try {
      const res = await callLogout();
      if (res && res.status === 200) {
        localStorage.removeItem("access_token");
        dispatch(setLogoutAction());
        message.success("Đăng xuất thành công");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      message.error("Đăng xuất thất bại");
    }
  };

  const handleSearch = async (value: string) => {
    if (value?.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
      setPopoverVisible(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim().length >= 2) {
      // Push value vào RxJS Subject
      searchSubject.current.next(value);
    } else {
      setPopoverVisible(false);
      setSearchResults([]);
    }
  };

  const handleLoadMore = () => {
    navigate(`/search?keyword=${encodeURIComponent(searchValue.trim())}`);
    setPopoverVisible(false);
  };

  const goToBookDetail = (bookId: number) => {
    if (bookId) {
      navigate(`/book/${bookId}`);
      setPopoverVisible(false);
    }
  };

  // Dropdown menu items
  const dropdownItems = [
    {
      label: <Link to="/my-profile">Trang Cá Nhân</Link>,
      key: "my-profile",
      icon: <ContactsOutlined />,
    },
    ...(user?.role?.name !== "USER"
      ? [
          {
            label: <Link to="/admin">Trang Quản Trị</Link>,
            key: "admin",
            icon: <FireOutlined />,
          },
        ]
      : []),
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </label>
      ),
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  // Popover content for search results
  const searchResultsContent = (
    <div className="search-results-container">
      {loading ? (
        <div className="search-loading">
          <Spin />
          <div className="loading-text">Đang tìm kiếm...</div>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <List
            dataSource={searchResults}
            renderItem={(book) => (
              <List.Item
                key={book.id}
                onMouseDown={() => goToBookDetail(book.id)}
              >
                <Card size="small">
                  <div className="book-item-content">
                    <img src={book.image} alt={book.name} />
                    <div className="book-info">
                      <div className="book-title">{book.name}</div>
                      <div className="book-author">Tác giả: {book.author}</div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />

          {totalItems > searchResults.length && (
            <div className="load-more-section">
              <Button type="link" onMouseDown={handleLoadMore}>
                Xem thêm
              </Button>
            </div>
          )}
        </>
      ) : searchValue.trim().length >= 2 ? (
        <Empty description="Không tìm thấy kết quả phù hợp" />
      ) : (
        <Empty description="Nhập ít nhất 2 ký tự để tìm kiếm" />
      )}
    </div>
  );

  return (
    <>
      <div className="header-section">
        <div className="container">
          {!isMobile ? (
            <div className="top-menu">
              <div className="logo">
                <h1>
                  <Link to="/">Bookspace</Link>
                </h1>
              </div>
              <div className="search-container" ref={searchRef}>
                <Popover
                  content={searchResultsContent}
                  placement="bottom"
                  trigger="click"
                  open={popoverVisible}
                  overlayStyle={{ width: 350 }}
                >
                  <Search
                    placeholder="Tìm kiếm sách..."
                    size="large"
                    value={searchValue}
                    onChange={handleSearchInput}
                    onSearch={handleSearch}
                    loading={loading}
                    enterButton={
                      loading ? <Spin size="small" /> : <SearchOutlined />
                    }
                    onFocus={() => {
                      if (searchValue.trim().length >= 2) {
                        setPopoverVisible(true);
                      }
                    }}
                  />
                </Popover>
              </div>
              <div className="extra">
                {!isAuthenticated ? (
                  <Link to="/login">Đăng Nhập</Link>
                ) : (
                  <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
                    <Space style={{ cursor: "pointer" }}>
                      <span>Xin chào, {user?.fullName}</span>
                      <Avatar
                        src={user?.image}
                        size={40}
                        style={{ border: "none" }}
                      >
                        {user?.fullName?.substring(0, 2)?.toUpperCase()}
                      </Avatar>
                    </Space>
                  </Dropdown>
                )}
              </div>
            </div>
          ) : (
            <div className="header-mobile">
              <div className="logo-mobile">
                <h1>
                  <Link to="/">Bookspace</Link>
                </h1>
              </div>
              <div className="mobile-actions">
                {isAuthenticated && (
                  <div className="mobile-user-info">
                    <Avatar
                      src={user?.image}
                      size={32}
                      style={{ border: "none", marginRight: "8px" }}
                    >
                      {user?.fullName?.substring(0, 2)?.toUpperCase()}
                    </Avatar>
                    <span className="mobile-user-name">
                      {user?.fullName}
                    </span>
                  </div>
                )}
                <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Drawer
        title={
          <div className="drawer-title">
            <span>Menu</span>
            {isAuthenticated && (
              <div className="drawer-user-info">
                <Avatar
                  src={user?.image}
                  size={40}
                  style={{ border: "none" }}
                >
                  {user?.fullName?.substring(0, 2)?.toUpperCase()}
                </Avatar>
                <span>{user?.fullName}</span>
              </div>
            )}
          </div>
        }
        placement="right"
        onClose={() => setOpenMobileMenu(false)}
        open={openMobileMenu}
        className="mobile-drawer"
      >
        {isAuthenticated ? (
          <Menu
            onClick={(e) => {
              handleMenuClick(e);
              setOpenMobileMenu(false);
            }}
            selectedKeys={[current]}
            mode="vertical"
            items={dropdownItems}
          />
        ) : (
          <div className="drawer-login-section">
            <p>Vui lòng đăng nhập để sử dụng các chức năng</p>
            <Button
              type="primary"
              block
              onClick={() => {
                navigate("/login");
                setOpenMobileMenu(false);
              }}
            >
              Đăng Nhập
            </Button>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default Header;
