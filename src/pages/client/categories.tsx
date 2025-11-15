import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SimpleBookCard from "components/client/book/SimpleBookCard";
import { Empty, Pagination, Select, Spin, Checkbox } from "antd";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { callGetExploreBooks, callFetchCategoriesUpload } from "api/services";
import { IBookSearch, ICategory } from "types/backend";
import "styles/categories.scss";

interface IBookPagination {
  current: number;
  pageSize: number;
  total: number;
}

interface IQueryParams {
  page: number;
  size: number;
  filter?: string;
  sort?: string;
}

interface ICategoryOption extends ICategory {
  checked?: boolean;
}

type SortType = "newest" | "oldest" | "a-z" | "z-a";

const CollectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<IBookSearch[]>([]);
  const [categories, setCategories] = useState<ICategoryOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortType, setSortType] = useState<SortType>("newest");
  const [bookPagination, setBookPagination] = useState<IBookPagination>({
    current: 0,
    pageSize: 30,
    total: 0,
  });

  const buildQuery = useCallback(
    (
      params: IBookPagination,
      categoryNames: string[],
      sortType: SortType
    ): string => {
      const q: IQueryParams = {
        page: params.current,
        size: params.pageSize,
      };

      // Xây dựng filter với OR condition cho categories
      if (categoryNames.length > 0) {
        const filterArray = categoryNames.map((name) =>
          sfLike("categories.name", name)
        );
        q.filter = filterArray.join(" or ");
      }

      // Xây dựng sort dựa trên sortType
      switch (sortType) {
        case "newest":
          q.sort = "updatedAt,desc";
          break;
        case "oldest":
          q.sort = "updatedAt,asc";
          break;
        case "a-z":
          q.sort = "name,asc";
          break;
        case "z-a":
          q.sort = "name,desc";
          break;
        default:
          q.sort = "updatedAt,desc";
      }

      const temp = queryString.stringify(q);
      return temp;
    },
    []
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const query = buildQuery(bookPagination, selectedCategories, sortType);
        const res = await callGetExploreBooks(query);
        if (res && res.data) {
          setBookData(res.data.result || []);
          setBookPagination((prev) => ({
            ...prev,
            total: res.data?.totalElements || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, sortType, bookPagination.current, buildQuery]);

  const fetchCategories = async () => {
    try {
      const query = `page=0&size=100&sort=createdAt,desc`;
      const res = await callFetchCategoriesUpload(query);
      if (res && res.data) {
        const categories = res?.data?.result ?? [];
        setCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    let newSelectedCategories: string[];
    if (checked) {
      newSelectedCategories = [...selectedCategories, categoryName];
      setSelectedCategories(newSelectedCategories);
    } else {
      newSelectedCategories = selectedCategories.filter(
        (cat) => cat !== categoryName
      );
      setSelectedCategories(newSelectedCategories);
    }
    // Reset lại trang về 0 khi filter thay đổi
    setBookPagination((prev) => ({
      ...prev,
      current: 0,
    }));
    // Update URL with selected categories
    const params = new URLSearchParams();
    if (newSelectedCategories.length > 0) {
      params.set("categories", newSelectedCategories.join(","));
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleBookPageChange = (page: number) => {
    setBookPagination((prev) => ({
      ...prev,
      current: page - 1,
    }));
  };

  const handleSortChange = (value: SortType) => {
    setSortType(value);
    setBookPagination((prev) => ({
      ...prev,
      current: 0,
    }));
  };

  useEffect(() => {
    fetchCategories();

    // Đọc categories từ URL params
    const params = new URLSearchParams(location.search);
    const categoriesParam = params.get("categories");
    if (categoriesParam) {
      const categoriesFromUrl = categoriesParam.split(",");
      setSelectedCategories(categoriesFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortOptions = [
    { label: "Mới nhất", value: "newest" as SortType },
    { label: "Cũ nhất", value: "oldest" as SortType },
    { label: "A - Z", value: "a-z" as SortType },
    { label: "Z - A", value: "z-a" as SortType },
  ];

  return (
    <div className="explore-page explore-page--with-sidebar">
      <div className="explore-page__title">TÂT CẢ SẢN PHẨM</div>

      <div className="explore-page__main-container">
        {/* Left Sidebar - Categories */}
        <aside className="explore-page__sidebar">
          <div className="explore-page__sidebar-title">THỂ LOẠI</div>
          <div className="explore-page__sidebar-content">
            {categories.map((category) => (
              <div key={category.id} className="explore-page__checkbox-item">
                <Checkbox
                  checked={selectedCategories.includes(category.name || "")}
                  onChange={(e) =>
                    handleCategoryChange(category.name || "", e.target.checked)
                  }
                >
                  {category.name}
                </Checkbox>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content - Books */}
        <div className="explore-page__content-wrapper">
          {/* Sort Controls */}
          <div className="explore-page__sort-controls">
            <Select
              value={sortType}
              onChange={handleSortChange}
              className="explore-page__sort-select"
              options={sortOptions}
            />
          </div>

          {/* Content */}
          <div className="explore-page__content">
            {loading ? (
              <div className="explore-page__loading">
                <Spin size="large" />
              </div>
            ) : bookData.length === 0 ? (
              <div className="explore-page__empty">
                <Empty description="Không tìm thấy sách nào" />
              </div>
            ) : (
              <div className="explore-page__book-grid explore-page__book-grid--4-cols">
                {bookData.map((book, index) => (
                  <div
                    key={`${book.id}-${index}`}
                    className="explore-page__book-item"
                  >
                    <SimpleBookCard book={book} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {bookData.length > 0 && (
            <div className="explore-page__pagination">
              <Pagination
                current={bookPagination.current + 1}
                pageSize={bookPagination.pageSize}
                total={bookPagination.total}
                onChange={handleBookPageChange}
                showSizeChanger={false}
                responsive
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
