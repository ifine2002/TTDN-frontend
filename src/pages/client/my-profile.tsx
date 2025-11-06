import { useState, useEffect } from "react";
import { Empty, Spin } from "antd";
import { calUnfollow, callCreateFollow } from "api/services";
import { useAppSelector } from "redux/hooks";
import "styles/profile.scss";

// Custom hooks
import { useProfileData } from "hooks/useProfileData";
import { useFavoriteBooks } from "hooks/useFavoriteBooks";
import { useModalAndUI } from "hooks/useModalAndUI";

// Components
import ChangeInfoModal from "components/client/my-profile/ChangeInfoModal";
import ProfileHeader from "components/client/my-profile/ProfileHeader";
import FollowersModal from "components/client/my-profile/FollowersModal";
import ProfileContent from "components/client/profile/ProfileContent";
import { IFollow } from "@/types/backend";

// Types
interface FollowStates {
  [userId: number]: boolean;
}

const MyProfilePage = () => {
  const user = useAppSelector((state) => state.account.user);
  const id = user.id;

  // Use custom hooks
  const { userData, loading, books, pagination, handleLoadMore } =
    useProfileData(id);

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

  // Local states for follow management
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [followingStates, setFollowingStates] = useState<FollowStates>({});
  const [followerStates, setFollowerStates] = useState<FollowStates>({});

  // Initialize following states
  useEffect(() => {
    if (userData?.following) {
      const initialStates: FollowStates = {};
      userData.following.forEach((user) => {
        initialStates[user.id] = true;
      });
      setFollowingStates(initialStates);
    }
  }, [userData]);

  // Initialize follower states
  useEffect(() => {
    if (userData?.follower) {
      const initialStates: FollowStates = {};
      userData.follower.forEach((user) => {
        const isFollowing = userData.following?.some(
          (followingUser) => followingUser.id === user.id
        );
        initialStates[user.id] = isFollowing || false;
      });
      setFollowerStates(initialStates);
    }
  }, [userData]);

  // Handle tab change
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === "books" && !favoriteLoaded && userData?.id) {
      resetAndFetchFavoriteBooks();
    }
  };

  // Handle follow/unfollow for following list
  const handleFollowToggle = async (userId: number) => {
    try {
      const follow: IFollow = {
        followerId: userData?.id,
        followingId: userId,
      };

      if (followingStates[userId]) {
        await calUnfollow(follow);
        setFollowingStates((prev) => ({ ...prev, [userId]: false }));
      } else {
        await callCreateFollow(follow);
        setFollowingStates((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện follow/unfollow:", error);
    }
  };

  // Handle follow/unfollow for follower list
  const handleFollowerFollowToggle = async (userId: number) => {
    try {
      const follow = {
        followerId: userData?.id,
        followingId: userId,
      };

      if (followerStates[userId]) {
        await calUnfollow(follow);
        setFollowerStates((prev) => ({ ...prev, [userId]: false }));
      } else {
        await callCreateFollow(follow);
        setFollowerStates((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện follow/unfollow:", error);
    }
  };

  const editProfile = () => {
    setEditProfileVisible(true);
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

      <ChangeInfoModal
        editProfileVisible={editProfileVisible}
        setEditProfileVisible={setEditProfileVisible}
        id={id}
      />
    </div>
  );
};

export default MyProfilePage;
