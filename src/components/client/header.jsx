import { useState, useEffect, useRef } from 'react';
import { ContactsOutlined, FireOutlined, LogoutOutlined, MenuFoldOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, Space, message, Input, Menu, List, Card, Spin, Empty, Button, Popover } from 'antd';
import { isMobile } from 'react-device-detect';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './../../redux/hooks';
import { callLogout, callSearchHomeBook } from './../../api/services';
import { setLogoutAction } from './../../redux/slice/accountSlice';
import './../../styles/header.scss';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';

const { Search } = Input; 

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const searchRef = useRef(null);
    const searchSubject = useRef(new Subject());

    // App state
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    
    // Component state
    const [current, setCurrent] = useState('home');
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [popoverVisible, setPopoverVisible] = useState(false);
    
    const pageSize = 5;

    // Effects
    useEffect(() => {
        setCurrent(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setPopoverVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // RxJS search subscription
    useEffect(() => {
        const subscription = searchSubject.current.pipe(
            // Bỏ qua các giá trị không cần thiết
            filter(value => typeof value === 'string'),
            // Loại bỏ các giá trị trùng lặp
            distinctUntilChanged(),
            // Đợi 500ms trước khi thực hiện tìm kiếm
            debounceTime(500),
            // Lọc các giá trị rỗng hoặc quá ngắn
            filter(value => value.trim().length >= 2),
            // Chuyển đổi query thành API call và hủy các request cũ nếu có query mới
            switchMap(value => {
                setLoading(true);
                setPopoverVisible(true);
                const query = `page=${currentPage}&size=${pageSize}&keyword=${encodeURIComponent(value.trim())}`;
                return callSearchHomeBook(query);
            })
        ).subscribe({
            next: (res) => {
                if (res?.data) {
                    setSearchResults(res.data.result || []);
                    setTotalItems(res.data.totalElements || 0);
                }
                setLoading(false);
            },
            error: (err) => {
                console.error("Lỗi khi tìm kiếm sách:", err);
                setLoading(false);
            }
        });

        // Cleanup subscription khi component unmount
        return () => subscription.unsubscribe();
    }, [currentPage]);

    // Event handlers
    const handleMenuClick = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        try {
            const res = await callLogout();
            if (res && res.status === 200) {
                localStorage.removeItem('access_token');
                dispatch(setLogoutAction({}));
                message.success('Đăng xuất thành công');
                navigate('/');
            }
        } catch (error) {
            message.error('Đăng xuất thất bại');
        }
    };

    const handleSearch = async (value) => {
        if (value?.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
            setPopoverVisible(false);
        }
    };

    const handleSearchInput = (e) => {
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

    const goToBookDetail = (bookId) => {
        if (bookId) {
            navigate(`/book/${bookId}`);
            setPopoverVisible(false);
        }
    };

    // Dropdown menu items
    const dropdownItems = [
        {
            label: <Link to="/my-profile">Trang Cá Nhân</Link>,
            key: 'my-profile',
            icon: <ContactsOutlined />
        },
        ...(user?.role?.name !== 'USER' ? [
            {
                label: <Link to="/admin">Trang Quản Trị</Link>,
                key: 'admin',
                icon: <FireOutlined />
            },
        ] : []),
        {
            label: <label style={{ cursor: 'pointer' }} onClick={handleLogout}>Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
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
                        renderItem={book => (
                            <List.Item 
                                key={book.id}
                                onMouseDown={() => goToBookDetail(book.id)}
                            >
                                <Card 
                                    size="small"
                                    styles={{ padding: '8px' }}
                                >
                                    <div className="book-item-content">
                                        <img
                                            src={book.image}
                                            alt={book.name}
                                        />
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
                            <Button 
                                type="link" 
                                onMouseDown={handleLoadMore}
                            >
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
                            <div className='logo'>
                                <h1><Link to="/">Goodreads</Link></h1>
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
                                        enterButton={loading ? <Spin size="small" /> : <SearchOutlined />}
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
                                    <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
                                        <Space style={{ cursor: "pointer" }}>
                                            <span>Welcome {user?.fullName}</span>
                                            <Avatar src={user?.image} size={40} style={{border: 'none'}}>{user?.fullName?.substring(0, 2)?.toUpperCase()}</Avatar>
                                        </Space>
                                    </Dropdown>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="header-mobile">
                            <span>Your APP</span>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    )}
                </div>
            </div>
            <Drawer
                title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={handleMenuClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={dropdownItems}
                />
            </Drawer>
        </>
    );
};

export default Header;
