import { Tabs, Typography } from "antd";
import { AuditOutlined, BookOutlined } from '@ant-design/icons';
import BookList from '../../client/book/BookList';

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfileTabs = ({
    userData,
    books,
    loading,
    pagination,
    onLoadMore,
    favoriteBooks,
    loadingFavorite,
    favoritePagination,
    onLoadMoreFavorite,
    onFavoritePageChange,
    onTabChange,
    activeTab
}) => {
    return (
        <div className="profile-content">
            <Tabs defaultActiveKey="post" activeKey={activeTab} onChange={onTabChange} className="profile-tabs mt-6">
                <TabPane 
                    tab={<span><AuditOutlined />Bài Viết</span>} 
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
                                onLoadMore={onLoadMore}
                            />
                        </div>
                    </div>
                </TabPane>
                <TabPane 
                    tab={<span><BookOutlined />Yêu Thích</span>} 
                    key="books"
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Title level={5} className="mb-4">Sách yêu thích</Title>
                            <BookList
                                books={favoriteBooks}
                                loading={loadingFavorite}
                                pagination={favoritePagination}
                                onLoadMore={onLoadMoreFavorite}
                                onPageChange={onFavoritePageChange}
                                simple={true}
                            />
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ProfileTabs; 