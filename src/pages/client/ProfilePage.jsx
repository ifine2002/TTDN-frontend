import { useState, useEffect, useRef } from "react";
import { callFetchUserProfile, callGetAllPostOfUser, callFetchAllBookFavoriteOfUser, } from "../../api/services";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Empty } from "antd";
import queryString from 'query-string';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import { useAppSelector, useAppDispatch } from './../../redux/hooks';
import './../../styles/ProfilePage.scss';
import { fetchFollowing } from './../../redux/slice/followSlice';
// Import components
import ProfileHeader from '../../components/client/profile/ProfileHeader';
import FollowersModal from '../../components/client/profile/FollowersModal';
import ProfileContent from '../../components/client/profile/ProfileContent';
import { throttle, getScrollbarWidth } from '../../utils/scrollUtils';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followerVisible, setFollowerVisible] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState("followers");
    const { id } = useParams();
    const user = useAppSelector(state => state.account.user);
    const listFollowing = useAppSelector(state => state.follow.result);
    const navigate = useNavigate();
    const isLoading = useRef(false);
    const headerRef = useRef(null);
    const dispatch = useAppDispatch();

    // State cho danh sách bài viết
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0
    });

    // WebSocket client
    const [stompClient, setStompClient] = useState(null);

    // State cho danh sách sách yêu thích
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [favoritePagination, setFavoritePagination] = useState({
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });
    const isFavoriteLoading = useRef(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);

    useEffect(() => {
        if (user && user.id && id && id.toString() === user.id.toString()) {
            navigate('/my-profile', { replace: true });
        }
        if (user && user.id) {
            dispatch(fetchFollowing({ query: '' }));
        }
    }, [id, user, navigate, dispatch]);

    useEffect(() => {
        if (id && userData?.email) {
            resetAndFetchBooks();
        }
    }, [id, userData]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const res = await callFetchUserProfile(id);
                if (res && res.data) {
                    setUserData(res.data);
                    // Nếu đã đăng nhập mới kiểm tra follow
                    if (res.data.follower && user?.id) {
                        const isFollowerUser = res.data.follower.some(follower => follower.id === user.id);
                        setIsFollowing(isFollowerUser);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id, user?.id]);

    // WebSocket setup
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to WebSocket');
            client.subscribe('/topic/books', (message) => {
                try {
                    const notificationData = JSON.parse(message.body);
                    console.log('WebSocket notification received:', notificationData);
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
                        if (approvedBook.user.id.toString() === id.toString()) {
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
            console.log('Disconnected from WebSocket');
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

    const fetchBooks = async (pageNumber) => {
        if (isLoading.current) {
            console.log('Fetch already in progress, skipping');
            return Promise.resolve();
        }

        console.log(`Starting fetch for page ${pageNumber}...`);
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

    // Scroll handling
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

    // Modal scroll handling
    useEffect(() => {
        if (followerVisible) {
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
    }, [followerVisible]);

    // Favorite books handling
    useEffect(() => {
        if (id && userData?.email) {
            resetAndFetchFavoriteBooks();
        }
    }, [id, userData]);

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

    const handleLoadMore = () => {
        if (isLoading.current) {
            console.log('Loading already in progress, ignoring load more request');
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

    const handleLoadMoreFavorite = () => {
        if (isFavoriteLoading.current) return;
        const nextPage = favoritePagination.page + 1;
        if (nextPage <= favoritePagination.totalPages) {
            fetchFavoriteBooks(nextPage, favoritePagination.pageSize);
        }
    };

    const handleFavoritePageChange = (page, pageSize) => {
        console.log('Changing page:', page, 'pageSize:', pageSize);
        fetchFavoriteBooks(page, pageSize);
    };

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

    return (
        <div className="max-w-full p-4">
            <ProfileHeader
                userData={userData}
                isFollowing={isFollowing}
                setIsFollowing={setIsFollowing}
                showFollowersModal={showFollowersModal}
                showFollowingModal={showFollowingModal}
                headerRef={headerRef}
                currentUser={user}
            />

            <FollowersModal
                followerVisible={followerVisible}
                handleModalClose={handleModalClose}
                activeModalTab={activeModalTab}
                setActiveModalTab={setActiveModalTab}
                userData={userData}
                listFollowing={listFollowing}
                currentUser={user}
            />

            <ProfileContent
                userData={userData}
                books={books}
                loading={loading}
                pagination={pagination}
                handleLoadMore={handleLoadMore}
                favoriteBooks={favoriteBooks}
                loadingFavorite={loadingFavorite}
                favoritePagination={favoritePagination}
                handleLoadMoreFavorite={handleLoadMoreFavorite}
                handleFavoritePageChange={handleFavoritePageChange}
            />
        </div>
    );
};

export default ProfilePage;