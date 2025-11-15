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

const getCategoriesFromSearch = (search: string) => {
  const params = new URLSearchParams(search);
  const categoriesParam = params.get("categories");
  if (!categoriesParam) return [];
  return categoriesParam
    .split(",")
    .map((s) => {
      try {
        return decodeURIComponent(s.trim());
      } catch {
        return s.trim();
      }
    })
    .filter(Boolean);
};

const CollectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<IBookSearch[]>([]);
  const [categories, setCategories] = useState<ICategoryOption[]>([]);
  // init selectedCategories from URL immediately
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    getCategoriesFromSearch(window.location.search || location.search)
  );
  const [sortType, setSortType] = useState<SortType>("newest");
  const [bookPagination, setBookPagination] = useState<IBookPagination>({
    current: 0,
    pageSize: 20,
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
        // Lưu ý: backend cần chấp nhận biểu thức nối " or "
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

  // Sync when location.search changes (e.g. navigate from Explore)
  useEffect(() => {
    const cats = getCategoriesFromSearch(location.search);
    const same =
      cats.length === selectedCategories.length &&
      cats.every((c, i) => c === selectedCategories[i]);
    if (!same) {
      setSelectedCategories(cats);
      setBookPagination((prev) => ({ ...prev, current: 0 })); // reset page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const query = buildQuery(bookPagination, selectedCategories, sortType);
        const res = await callGetExploreBooks(query);
        if (res && res.data) {
          // backend có thể trả result hoặc content
          const result = res.data.result ?? [];
          setBookData(result || []);
          setBookPagination((prev) => ({
            ...prev,
            total:
              res.data?.totalElements ??
              (Array.isArray(result) ? result.length : 0),
          }));
        } else {
          setBookData([]);
          setBookPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBookData([]);
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

  useEffect(() => {
    fetchCategories();

    // initial parse from URL already done in state initializer
    // but ensure page reset if there are params
    const params = new URLSearchParams(location.search);
    const categoriesParam = params.get("categories");
    if (categoriesParam) {
      // setSelectedCategories will be handled by the location.search effect
      setBookPagination((prev) => ({ ...prev, current: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    let newSelectedCategories: string[];
    if (checked) {
      newSelectedCategories = [...selectedCategories, categoryName];
    } else {
      newSelectedCategories = selectedCategories.filter(
        (cat) => cat !== categoryName
      );
    }

    // Update state & reset page
    setSelectedCategories(newSelectedCategories);
    setBookPagination((prev) => ({
      ...prev,
      current: 0,
    }));

    // Update URL but preserve other params (e.g., sort)
    const params = new URLSearchParams(location.search);
    if (newSelectedCategories.length > 0) {
      params.set("categories", newSelectedCategories.join(","));
    } else {
      params.delete("categories");
    }
    // Keep sort param if exists (optional)
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
  };

  const handleBookPageChange = (page: number) => {
    setBookPagination((prev) => ({
      ...prev,
      current: page - 1,
    }));
    // update URL page param optionally if you want to persist in URL
    const params = new URLSearchParams(location.search);
    params.set("page", String(page - 1));
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
  };

  const handleSortChange = (value: SortType) => {
    setSortType(value);
    setBookPagination((prev) => ({
      ...prev,
      current: 0,
    }));
    // update URL maybe
    const params = new URLSearchParams(location.search);
    params.set("sort", value);
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
  };

  const sortOptions = [
    { label: "Mới nhất", value: "newest" as SortType },
    { label: "Cũ nhất", value: "oldest" as SortType },
    { label: "A - Z", value: "a-z" as SortType },
    { label: "Z - A", value: "z-a" as SortType },
  ];

  return (
    <div className="explore-page explore-page--with-sidebar">
      <div className="explore-page__title">TẤT CẢ SẢN PHẨM</div>

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
