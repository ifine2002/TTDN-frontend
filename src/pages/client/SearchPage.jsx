import React, { useState, useEffect, useRef } from 'react';
import { Input, Tabs, Pagination, Empty, Spin, Rate } from 'antd';
import { callSearchHomeBook, callSearchUser } from './../../api/services';
import './../../styles/BookDetail.scss';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { TabPane } = Tabs;
const { Search } = Input;

const SearchPage = () => {
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('books');
    const [bookData, setBookData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [bookPagination, setBookPagination] = useState({
        current: 0,
        pageSize: 8,
        total: 0
    });
    const [userPagination, setUserPagination] = useState({
        current: 0,
        pageSize: 8,
        total: 0
    });

    const isUrlUpdate = useRef(false);
    const isInitialMount = useRef(true);

    const navigate = useNavigate();
    const location = useLocation();
    
    // Xử lý URL parameters và tải dữ liệu ban đầu
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('query') || params.get('keyword') || '';
        const tab = params.get('tab') || 'books';
        
        isUrlUpdate.current = true;
        
        setSearchText(query);
        setActiveTab(tab);
        
        if (query) {
            if (tab === 'books') {
                fetchBooks(query, 0);
            } else {
                fetchUsers(query, 0);
            }
        }
        
        setTimeout(() => {
            isUrlUpdate.current = false;
        }, 100);
    }, [location.search]);

    // Xử lý nút tìm kiếm được nhấn
    const handleSearch = (value) => {
        if (!value.trim()) return;
        
        isUrlUpdate.current = true;
        navigate(`/search?keyword=${encodeURIComponent(value)}&tab=${activeTab}`);
        
        if (activeTab === 'books') {
            fetchBooks(value, 0);
        } else {
            fetchUsers(value, 0);
        }
        
        setTimeout(() => {
            isUrlUpdate.current = false;
        }, 100);
    };

    // Xử lý khi chuyển tab
    const handleTabChange = (key) => {
        if (key === activeTab) return;
        
        setActiveTab(key);
        
        if (searchText) {
            navigate(`/search?keyword=${encodeURIComponent(searchText)}&tab=${key}`);
            
            if (key === 'books') {
                fetchBooks(searchText, 0);
            } else {
                fetchUsers(searchText, 0);
            }
        }
    };

    // Hàm gọi API tìm sách
    const fetchBooks = async (query, page) => {
        if (!query.trim()) return;
        
        try {
            setLoading(true);
            const queryParams = `page=${page}&size=${bookPagination.pageSize}&keyword=${encodeURIComponent(query.trim())}`;
            const res = await callSearchHomeBook(queryParams);
            
            if (res?.data) {
                setBookData(res.data.result || []);
                setBookPagination({
                    ...bookPagination,
                    current: page,
                    total: res.data.totalElements || 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sách:', error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API tìm người dùng
    const fetchUsers = async (query, page) => {
        if (!query.trim()) return;
        
        try {
            setLoading(true);
            
            const queryParams = `page=${page}&size=${userPagination.pageSize}&keyword=${encodeURIComponent(query.trim())}`;
            
            const res = await callSearchUser(queryParams);
            if (res?.data) {
                setUserData(res.data.result || []);
                setUserPagination({
                    ...userPagination,
                    current: page,
                    total: res.data.totalElements || 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng:', error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý phân trang sách
    const handleBookPageChange = (page) => {
        fetchBooks(searchText, page-1);
    };

    // Xử lý phân trang người dùng
    const handleUserPageChange = (page) => {
        fetchUsers(searchText, page-1);
    };

    // Xử lý thay đổi input - chỉ cập nhật state, không gọi tìm kiếm
    const handleInputChange = (e) => {
        setSearchText(e.target.value);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
            <div className="w-full">
                <h1 className="text-2xl font-semibold mb-5">Tìm kiếm</h1>
                <Search
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchText}
                    onChange={handleInputChange}
                    onSearch={handleSearch}
                    enterButton
                    size="large"
                    className="mb-5"
                />
                
                <Tabs activeKey={activeTab} onChange={handleTabChange} className="mt-4">
                    <TabPane tab="Sách" key="books">
                        <Spin spinning={loading}>
                            {bookData.length > 0 ? (
                                <>
                                    <div className="flex flex-col space-y-4 mb-5">
                                        {bookData.map(book => (
                                            <div key={book.id} className="flex border-b border-gray-200 pb-4">
                                                <div className="w-20 h-28 flex-shrink-0 mr-5">
                                                    <img 
                                                        src={book.image} 
                                                        alt={book.name}
                                                        className="w-full h-full object-cover shadow-md" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-lg font-semibold mb-1">
                                                        <Link to={`/book/${book.id}`} className="text-blue-600 hover:underline">{book.name}</Link>
                                                    </div>
                                                    <div className="text-sm text-gray-700 mb-2">
                                                        Tác giả: {book.author}
                                                    </div>
                                                    <div className="flex items-center mb-2">
                                                        <Rate allowHalf disabled value={book.averageRating || 0} className="text-sm" /> 
                                                        <span className="text-xs text-gray-500 ml-3">
                                                            {book.averageRating || 0} avg rating — {book.ratingCount || 0} ratings
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-3">
                                                        published {book.publishedDate}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {bookPagination.total > bookPagination.pageSize && (
                                        <div className="flex justify-center mt-5">
                                            <Pagination 
                                                current={bookPagination.current + 1}
                                                pageSize={bookPagination.pageSize}
                                                total={bookPagination.total}
                                                onChange={handleBookPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Empty description={searchText ? "Không tìm thấy sách nào" : "Vui lòng nhập từ khóa và nhấn tìm kiếm"} />
                            )}
                        </Spin>
                    </TabPane>
                    
                    <TabPane tab="Người dùng" key="users">
                        <Spin spinning={loading}>
                            {searchText ? (
                                userData.length > 0 ? (
                                    <div className="flex flex-col space-y-4">
                                        {userData.map(user => (
                                            <div key={user.id} 
                                                className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow duration-300"
                                                onClick={() => navigate(`/profile/${user.id}`)}
                                            >
                                                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mr-5">
                                                    <img 
                                                        src={user.image || 'https://via.placeholder.com/150'} 
                                                        alt={user.fullName} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-2">{user.fullName}</h3>
                                                    <p className="text-gray-600 mb-1">{user.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {userPagination.total > userPagination.pageSize && (
                                            <div className="flex justify-center mt-5">
                                                <Pagination 
                                                    current={userPagination.current + 1}
                                                    pageSize={userPagination.pageSize}
                                                    total={userPagination.total}
                                                    onChange={handleUserPageChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Empty description="Không tìm thấy người dùng nào" />
                                )
                            ) : (
                                <Empty description="Vui lòng nhập từ khóa và nhấn tìm kiếm" />
                            )}
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default SearchPage;