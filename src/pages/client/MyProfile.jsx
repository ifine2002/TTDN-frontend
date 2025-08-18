import { useState, useEffect, useRef } from "react";
import { callFetchUserProfile, callGetAllPostOfUser, callFetchAllBookFavoriteOfUser, calUnfollow, callCreateFollow } from "../../api/services";
import { Empty, Spin } from "antd"; 
import queryString from 'query-string';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import { useAppSelector } from './../../redux/hooks';
import './../../styles/ProfilePage.scss';
import ChangeInfoModal from "../../components/client/my-profile/ChangeInfoModal";
import ProfileHeader from "../../components/client/my-profile/ProfileHeader";
import FollowersModal from "../../components/client/my-profile/FollowersModal";
import ProfileTabs from "../../components/client/my-profile/ProfileTabs";
import { throttle, getScrollbarWidth } from '../../utils/scrollUtils';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followerVisible, setFollowerVisible] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState("followers");
    const [followingStates, setFollowingStates] = useState({});
    const [followerStates, setFollowerStates] = useState({});
    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("post");
    
    const user = useAppSelector(state => state.account.user);
    const id = user.id;
    const isLoading = useRef(false);
    const headerRef = useRef(null);
    
    // Thêm state cho danh sách bài viết
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0
    });
    
    // WebSocket client
    const [stompClient, setStompClient] = useState(null);

    // Thêm state cho danh sách sách yêu thích
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [favoritePagination, setFavoritePagination] = useState({
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });
    const isFavoriteLoading = useRef(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [favoriteLoaded, setFavoriteLoaded] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const res = await callFetchUserProfile(id);
                if (res && res.data) {
                    setUserData(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchUserProfile();
        }
    }, [id, user?.id]);
    
    // Khởi tạo WebSocket
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                // console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // console.log('Connected to WebSocket');
            client.subscribe('/topic/books', (message) => {
                try {
                    const notificationData = JSON.parse(message.body);
                    // console.log('WebSocket notification received:', notificationData);
                    if (notificationData.userId === id) {
                        resetAndFetchBooks();
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            // Subscribe đến topic duyệt sách từ trang admin approval
            client.subscribe('/topic/admin-books', (message) => {
                try {
                    const notificationData = JSON.parse(message.body);
                    if (notificationData.action === 'approve') {
                        const approvedBook = notificationData.data;
                        // Chỉ thêm vào danh sách nếu sách thuộc về user này
                        if (approvedBook.user?.id === id) {
                            setBooks(prevBooks => {
                                if (prevBooks.some(book => book.bookId === approvedBook.bookId)) {
                                    return prevBooks;
                                }
                                return [approvedBook, ...prevBooks];
                            });
                            setPagination(prev => ({
                                ...prev,
                                totalElements: prev.totalElements + 1
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error parsing admin book WebSocket message:', error);
                }
            });
        };

        client.onDisconnect = () => {
            // console.log('Disconnected from WebSocket');
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [id]);

    // Fetch books lần đầu khi component mount
    useEffect(() => {
        if (id && userData?.email) {
            resetAndFetchBooks();
        }
    }, [id, userData]);

    // Reset dữ liệu và fetch lại từ đầu
    const resetAndFetchBooks = () => {
        setBooks([]);
        setPagination(prev => ({
            ...prev,
            page: 1,
            totalElements: 0,
            totalPages: 0
        }));
        
        fetchBooks(1);
    };

    // Hàm lấy dữ liệu sách từ API
    const fetchBooks = async (pageNumber) => {
        if (isLoading.current) {
            // console.log('Fetch already in progress, skipping');
            return Promise.resolve();
        }

        // console.log(`Starting fetch for page ${pageNumber}...`);
        isLoading.current = true;
        setLoading(true);
        
        try {
            const pageForApi = pageNumber - 1;
            const params = {
                page: pageForApi,
                size: pagination.pageSize,
                sort: 'updatedAt,desc',
                userId: id
            };

            const query = queryString.stringify(params);
            const response = await callGetAllPostOfUser(userData.email, query);
            if (response && response.data) {
                const { result, totalPages, totalElements } = response.data;
                
                if (pageNumber === 1) {
                    setBooks(result || []);
                } else {
                    setBooks(prevBooks => [...prevBooks, ...(result || [])]);
                }
                
                setPagination({
                    page: pageNumber,
                    pageSize: pagination.pageSize,
                    totalElements,
                    totalPages
                });
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Error fetching user posts:', error);
            return Promise.reject(error);
        } finally {
            setLoading(false);
            isLoading.current = false;
        }
    };

    useEffect(() => {
        if (followerVisible, editProfileVisible) {
            const originalBodyPaddingRight = window.getComputedStyle(document.body).paddingRight;
            const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
            const scrollbarWidth = getScrollbarWidth();
            const bodyPaddingRightValue = parseInt(originalBodyPaddingRight, 10) || 0;
    
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${bodyPaddingRightValue + scrollbarWidth}px`;
    
            const header = document.querySelector('.header-section');
            let originalHeaderPaddingRight = '0px';
            
            if (header) {
                originalHeaderPaddingRight = window.getComputedStyle(header).paddingRight;
                const currentHeaderPadding = parseInt(originalHeaderPaddingRight, 10) || 0;
                header.style.paddingRight = `${currentHeaderPadding + scrollbarWidth}px`;
            }
    
            return () => {
                document.body.style.overflow = originalBodyOverflow;
                document.body.style.paddingRight = originalBodyPaddingRight;
    
                if (header) {
                    header.style.paddingRight = originalHeaderPaddingRight;
                }
            };
        }
    }, [followerVisible, editProfileVisible]);

    // Xử lý khi người dùng cuộn xuống để tải thêm sách
    const handleLoadMore = () => {
        if (isLoading.current) {
            // console.log('Loading already in progress, ignoring load more request');
            return;
        }

        const nextPage = pagination.page + 1;
        
        if (nextPage <= pagination.totalPages) {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            fetchBooks(nextPage).then(() => {
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'auto'
                    });
                }, 100);
            });
        }
    };

    // Thêm effect để xử lý sự kiện scroll
    useEffect(() => {
        const handleScroll = throttle(() => {
            if (headerRef.current) {
                const scrollPosition = window.scrollY || document.documentElement.scrollTop;
                if (scrollPosition > 10) {
                    headerRef.current.classList.add('sticky');
                } else {
                    headerRef.current.classList.remove('sticky');
                }
            }
        }, 100);

        handleScroll();
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // Xử lý khi tab thay đổi
    const handleTabChange = (activeKey) => {
        setActiveTab(activeKey);
        
        // Chỉ gọi API fetchFavoriteBooks khi chuyển sang tab "books" (Yêu thích)
        if (activeKey === "books" && !favoriteLoaded && userData?.id) {
            resetAndFetchFavoriteBooks();
        }
    };

    // Reset dữ liệu và fetch lại từ đầu cho sách yêu thích
    const resetAndFetchFavoriteBooks = () => {
        setFavoriteBooks([]);
        setFavoritePagination(prev => ({
            ...prev,
            page: 1,
            totalElements: 0,
            totalPages: 0
        }));
        fetchFavoriteBooks(1, 5);
    };

    // Hàm lấy dữ liệu sách yêu thích từ API
    const fetchFavoriteBooks = async (pageNumber, pageSize = 5) => {
        if (isFavoriteLoading.current) {
            return Promise.resolve();
        }
        isFavoriteLoading.current = true;
        setLoadingFavorite(true);
        try {
            const pageForApi = pageNumber - 1;
            const params = {
                page: pageForApi,
                size: pageSize,
                userId: id
            };
            const query = queryString.stringify(params);
            const response = await callFetchAllBookFavoriteOfUser(userData.id, query);
            if (response && response.data) {
                const { result, totalPages, totalElements } = response.data;
                setFavoriteBooks(result || []);
                setFavoritePagination({
                    page: pageNumber,
                    pageSize: pageSize,
                    totalElements,
                    totalPages
                });
                setFavoriteLoaded(true);
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Error fetching favorite books:', error);
            return Promise.reject(error);
        } finally {
            setLoadingFavorite(false);
            isFavoriteLoading.current = false;
        }
    };

    // Xử lý khi người dùng thay đổi trang hoặc số lượng sách hiển thị
    const handleFavoritePageChange = (page, pageSize) => {
        // console.log('Changing page:', page, 'pageSize:', pageSize);
        fetchFavoriteBooks(page, pageSize);
    };

    // Xử lý khi người dùng cuộn xuống để tải thêm sách yêu thích
    const handleLoadMoreFavorite = () => {
        if (isFavoriteLoading.current) return;
        const nextPage = favoritePagination.page + 1;
        if (nextPage <= favoritePagination.totalPages) {
            fetchFavoriteBooks(nextPage, favoritePagination.pageSize);
        }
    };

    // Thêm hàm xử lý follow/unfollow
    const handleFollowToggle = async (userId) => {
        try {
            if (followingStates[userId]) {
                const follow = {
                    followerId: userData.id,
                    followingId: userId
                };
                const res = await calUnfollow(follow);
                setFollowingStates(prev => ({
                    ...prev,
                    [userId]: false
                }));
            } else {
                const follow = {
                    followerId: userData.id,
                    followingId: userId
                };
                const res = await callCreateFollow(follow);
                setFollowingStates(prev => ({
                    ...prev,
                    [userId]: true
                }));
            }
            
        } catch (error) {
            console.error("Lỗi khi thực hiện follow/unfollow:", error);
        }
    };

    // Thêm useEffect để khởi tạo trạng thái follow ban đầu
    useEffect(() => {
        if (userData?.following) {
            const initialStates = {};
            userData.following.forEach(user => {
                initialStates[user.id] = true;
            });
            setFollowingStates(initialStates);
        }
    }, [userData]);

    // Thêm useEffect để khởi tạo trạng thái follow cho followers
    useEffect(() => {
        if (userData?.follower) {
            const initialStates = {};
            userData.follower.forEach(user => {
                const isFollowing = userData.following?.some(followingUser => followingUser.id === user.id);
                initialStates[user.id] = isFollowing || false;
            });
            setFollowerStates(initialStates);
        }
    }, [userData]);

    // Thêm hàm xử lý follow/unfollow cho followers
    const handleFollowerFollowToggle = async (userId) => {
        try {
            if (followerStates[userId]) {
                const follow = {
                    followerId: userData.id,
                    followingId: userId
                };
                const res = await calUnfollow(follow);
                setFollowerStates(prev => ({
                    ...prev,
                    [userId]: false
                }));
            } else {
                const follow = {
                    followerId: userData.id,
                    followingId: userId
                };
                const res = await callCreateFollow(follow);
                setFollowerStates(prev => ({
                    ...prev,
                    [userId]: true
                }));
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện follow/unfollow:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Empty description="Không tìm thấy thông tin người dùng" />
            </div>
        );
    }

    const editProfile = () => {
        setEditProfileVisible(true);
    }

    const showFollowersModal = () => {
        setActiveModalTab("followers");
        setFollowerVisible(true);
    };

    const showFollowingModal = () => {
        setActiveModalTab("following");
        setFollowerVisible(true);
    };

    const handleModalClose = () => {
        setFollowerVisible(false);
    };

    return (
        <div className="max-w-6xl p-4">
            <ProfileHeader
                userData={userData}
                headerRef={headerRef}
                showFollowersModal={showFollowersModal}
                showFollowingModal={showFollowingModal}
                editProfile={editProfile}
            />

            <FollowersModal
                followerVisible={followerVisible}
                handleModalClose={handleModalClose}
                activeModalTab={activeModalTab}
                setActiveModalTab={setActiveModalTab}
                userData={userData}
                followerStates={followerStates}
                followingStates={followingStates}
                handleFollowerFollowToggle={handleFollowerFollowToggle}
                handleFollowToggle={handleFollowToggle}
            />

            <ProfileTabs
                userData={userData}
                books={books}
                loading={loading}
                pagination={pagination}
                onLoadMore={handleLoadMore}
                favoriteBooks={favoriteBooks}
                loadingFavorite={loadingFavorite}
                favoritePagination={favoritePagination}
                onLoadMoreFavorite={handleLoadMoreFavorite}
                onFavoritePageChange={handleFavoritePageChange}
                onTabChange={handleTabChange}
                activeTab={activeTab}
            />

            <ChangeInfoModal
                editProfileVisible={editProfileVisible}
                setEditProfileVisible={setEditProfileVisible}
                id={id}
            />
        </div>
    );
};

export default ProfilePage;