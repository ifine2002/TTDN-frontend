import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Empty } from "antd";
import { useAppSelector, useAppDispatch } from "redux/hooks";
import { fetchFollowing } from "redux/slice/followSlice";
import "styles/profile.scss";

// Custom hooks
import { useProfileData } from "hooks/useProfileData";
import { useFavoriteBooks } from "hooks/useFavoriteBooks";
import { useModalAndUI } from "hooks/useModalAndUI";

// Components
import ProfileHeader from "components/client/profile/ProfileHeader";
import FollowersModal from "components/client/profile/FollowersModal";
import ProfileContent from "components/client/profile/ProfileContent";

const ProfilePage = () => {
  const { id } = useParams();
  const user = useAppSelector((state) => state.account.user);
  const listFollowing = useAppSelector(
    (state) => state.follow.followings.result
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isFollowing, setIsFollowing] = useState(false);

  // Use custom hooks
  const { userData, loading, books, pagination, handleLoadMore } =
    useProfileData(+id!);
  const {
    favoriteBooks,
    favoritePagination,
    loadingFavorite,
    favoriteLoaded,
    resetAndFetchFavoriteBooks,
    handleLoadMoreFavorite,
    handleFavoritePageChange,
  } = useFavoriteBooks(userData?.id);

  const {
    followerVisible,
    activeModalTab,
    setActiveModalTab,
    activeTab,
    setActiveTab,
    headerRef,
    showFollowersModal,
    showFollowingModal,
    handleModalClose,
  } = useModalAndUI();

  // Redirect to my-profile if viewing own profile
  useEffect(() => {
    if (user && user.id && id && id.toString() === user.id.toString()) {
      navigate("/my-profile", { replace: true });
    }
    if (user && user.id) {
      dispatch(fetchFollowing({ query: "" }));
    }
  }, [id, user, navigate, dispatch]);

  // Update isFollowing state when userData changes
  useEffect(() => {
    if (userData?.follower && user?.id) {
      const isFollowerUser = userData.follower.some(
        (follower) => follower.id === user.id
      );
      setIsFollowing(isFollowerUser);
    }
  }, [userData, user?.id]);

  // Handle tab change
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === "books" && !favoriteLoaded && userData?.id) {
      resetAndFetchFavoriteBooks();
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
        handleTabChange={handleTabChange}
        activeTab={activeTab}
      />
    </div>
  );
};

export default ProfilePage;
