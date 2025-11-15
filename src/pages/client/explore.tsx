import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SimpleBookCard from "components/client/book/SimpleBookCard";
import { Empty, Spin, Carousel } from "antd";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { callGetExploreBooks, callFetchCategoriesUpload } from "api/services";
import { IBookSearch, ICategory } from "types/backend";
import banner1 from "assets/banner1.jpg";
import banner2 from "assets/banner2.jpg";
import banner3 from "assets/banner3.jpg";
import banner4 from "assets/banner4.jpg";
import "styles/explore.scss";

interface ICategoryWithBooks extends ICategory {
  books: IBookSearch[];
}

// Banner images - sử dụng 3 ảnh từ assets
const BANNER_IMAGES = [banner1, banner2, banner3, banner4];

// Danh sách các category sẽ được hiển thị trên trang explore
const DISPLAYED_CATEGORIES = [
  "Truyện ngắn",
  "Tiểu thuyết",
  "Lịch sử",
  "Tâm lý học",
  "Kinh doanh",
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoriesWithBooks, setCategoriesWithBooks] = useState<
    ICategoryWithBooks[]
  >([]);
  const [topNewBooks, setTopNewBooks] = useState<IBookSearch[]>([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const query = `page=0&size=100&sort=createdAt,desc`;
      const res = await callFetchCategoriesUpload(query);
      if (res && res.data) {
        // Lọc categories theo danh sách được chỉ định
        const allCategories = res?.data?.result ?? [];
        const categories = allCategories.filter((cat) =>
          DISPLAYED_CATEGORIES.includes(cat.name || "")
        );

        // Fetch top 6 new books
        const newBooksQuery = queryString.stringify({
          page: 0,
          size: 6,
          sort: "updatedAt,desc",
        });
        const booksRes = await callGetExploreBooks(newBooksQuery);
        if (booksRes && booksRes.data) {
          setTopNewBooks(booksRes.data.result || []);
        }

        // Fetch top 6 books for each category
        const categoriesData = await Promise.all(
          categories.map(async (category) => {
            const filterQuery = queryString.stringify({
              page: 0,
              size: 6,
              filter: sfLike("categories.name", category.name || ""),
              sort: "updatedAt,desc",
            });
            const categoryBooksRes = await callGetExploreBooks(filterQuery);
            return {
              ...category,
              books: categoryBooksRes?.data?.result || [],
            };
          })
        );

        setCategoriesWithBooks(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching categories and books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="explore-page">
      {loading ? (
        <div className="explore-page__full-loading">
          <div className="explore-page__loading">
            <Spin size="large" />
          </div>
        </div>
      ) : (
        <>
          {/* Carousel Banner Section */}
          <div className="explore-page__banner">
            <Carousel autoplay>
              {BANNER_IMAGES.map((image, index) => (
                <div key={index} className="explore-page__banner-slide">
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="explore-page__banner-image"
                  />
                </div>
              ))}
            </Carousel>
          </div>

          {/* Top New Books Section */}
          {topNewBooks.length > 0 && (
            <div className="explore-page__section">
              <div className="explore-page__section-title">Sách mới nhất</div>
              <div className="explore-page__book-grid">
                {topNewBooks.map((book, index) => (
                  <div
                    key={`top-book-${book.id}-${index}`}
                    className="explore-page__book-item"
                  >
                    <SimpleBookCard book={book} />
                  </div>
                ))}
              </div>
              <div className="explore-page__view-more">
                <a onClick={() => navigate("/collection")}>Xem thêm →</a>
              </div>
            </div>
          )}

          {/* Category Books Sections - only first 5 */}
          {categoriesWithBooks.length > 0 ? (
            categoriesWithBooks.map((category) =>
              category.books && category.books.length > 0 ? (
                <div key={category.id} className="explore-page__section">
                  <div className="explore-page__section-title">
                    {category.name}
                  </div>
                  <div className="explore-page__book-grid">
                    {category.books.map((book, index) => (
                      <div
                        key={`${category.id}-book-${book.id}-${index}`}
                        className="explore-page__book-item"
                      >
                        <SimpleBookCard book={book} />
                      </div>
                    ))}
                  </div>
                  <div className="explore-page__view-more">
                    <a
                      onClick={() =>
                        navigate(
                          `/collection?categories=${encodeURIComponent(
                            category.name || ""
                          )}`
                        )
                      }
                    >
                      Xem thêm →
                    </a>
                  </div>
                </div>
              ) : null
            )
          ) : (
            <div className="explore-page__empty">
              <Empty description="Không tìm thấy sách nào" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExplorePage;
