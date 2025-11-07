import { Tabs, Typography } from "antd";
import { AuditOutlined, BookOutlined } from "@ant-design/icons";
import BookList from "../book/BookList";
import { IBookSearch, IPost, IUser } from "@/types/backend";

const { Title } = Typography;
const { TabPane } = Tabs;

interface IProps {
  userData: IUser;
  books: IPost[];
  loading: boolean;
  pagination: any;
  handleLoadMore: () => void;
  favoriteBooks: IBookSearch[];
  loadingFavorite: boolean;
  favoritePagination: any;
  handleLoadMoreFavorite: () => void;
  handleFavoritePageChange: (page: number, pageSize: number) => void;
  handleTabChange: (v: string) => void;
  activeTab: string;
}
const ProfileContent = (props: IProps) => {
  const {
    userData,
    books,
    loading,
    pagination,
    handleLoadMore,
    favoriteBooks,
    loadingFavorite,
    favoritePagination,
    handleLoadMoreFavorite,
    handleFavoritePageChange,
    handleTabChange,
    activeTab,
  } = props;
  return (
    <div className="profile-content">
      <Tabs
        defaultActiveKey="post"
        activeKey={activeTab}
        onChange={handleTabChange}
        className="profile-tabs mt-6"
      >
        <TabPane
          tab={
            <span>
              <AuditOutlined />
              Bài Viết
            </span>
          }
          key="post"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Title level={5} className="mb-4">
                Bài viết của {userData.fullName}
              </Title>
              <BookList
                books={books}
                loading={loading}
                pagination={pagination}
                onLoadMore={handleLoadMore}
              />
            </div>
          </div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <BookOutlined />
              Yêu Thích
            </span>
          }
          key="books"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Title level={5} className="mb-4">
                Sách yêu thích
              </Title>
              <BookList
                books={[]}
                favoriteBooks={favoriteBooks}
                loading={loadingFavorite}
                pagination={favoritePagination}
                onLoadMore={handleLoadMoreFavorite}
                onPageChange={handleFavoritePageChange}
                simple={true}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfileContent;
