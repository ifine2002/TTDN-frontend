import { useState, useEffect, useRef } from "react";
import SimpleBookCard from "components/client/book/SimpleBookCard";
import { Empty, Pagination, Input, Select, Spin } from "antd";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import { callGetExploreBooks, callFetchCategoriesUpload } from "api/services";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter } from "rxjs/operators";
import { IBookSearch } from "types/backend";
import "styles/explore.scss";

interface IBookPagination {
  current: number;
  pageSize: number;
  total: number;
}

interface IFilters {
  author: string;
  category?: string;
}

interface IQueryParams {
  page: number;
  size: number;
  filter?: string;
}

interface ICategoryOption {
  label?: string;
  value?: string;
  key?: number;
}

const ExplorePage = () => {
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<IBookSearch[]>([]);
  const [categories, setCategories] = useState<ICategoryOption[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [bookPagination, setBookPagination] = useState<IBookPagination>({
    current: 0,
    pageSize: 6,
    total: 0,
  });
  const [filters, setFilters] = useState<IFilters>({
    author: "",
    category: undefined,
  });

  // Sử dụng useRef để giữ Subject qua các lần render
  const authorInputSubject = useRef(new Subject());

  const fetchCategories = async () => {
    try {
      const query = `page=0&size=100&sort=createdAt,desc`;
      const res = await callFetchCategoriesUpload(query);
      if (res && res.data) {
        const arr =
          res?.data?.result?.map((item) => {
            return {
              label: item.name,
              value: item.name,
              key: item.id,
            };
          }) ?? [];
        setCategories(arr);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const query = buildQuery(bookPagination, filters);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // RxJS search subscription - setup tương tự như header.jsx
  useEffect(() => {
    const subscription = authorInputSubject.current
      .pipe(
        // Loại bỏ các giá trị không phải chuỗi
        filter((value) => typeof value === "string"),
        // Loại bỏ các giá trị trùng lặp
        distinctUntilChanged(),
        // Đợi 500ms trước khi cập nhật
        debounceTime(500)
      )
      .subscribe((value) => {
        setFilters((prev) => ({
          ...prev,
          author: value,
        }));
        // Reset lại trang về 0 khi filter thay đổi
        setBookPagination((prev) => ({
          ...prev,
          current: 0,
        }));
      });

    // Cleanup subscription khi component unmount
    return () => subscription.unsubscribe();
  }, []);

  // Gọi API khi filters hoặc pagination thay đổi
  useEffect(() => {
    fetchBooks();
  }, [filters, bookPagination.current, bookPagination.pageSize]);

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Cập nhật UI ngay lập tức
    setInputValue(value);

    // Emit giá trị vào subject để xử lý debounce
    authorInputSubject.current.next(value);
  };

  const handleBookPageChange = (page: number) => {
    setBookPagination((prev) => ({
      ...prev,
      current: page - 1,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value,
    }));
    setBookPagination((prev) => ({
      ...prev,
      current: 0,
    }));
  };

  const buildQuery = (params: IBookPagination, filters: IFilters) => {
    const q: IQueryParams = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filterArray: string[] = [];

    if (filters.author) filterArray.push(`${sfLike("author", filters.author)}`);
    if (filters.category)
      filterArray.push(`${sfLike("categories.name", filters.category)}`);

    if (filterArray.length > 0) {
      q.filter = filterArray.join(" and ");
    }

    if (!q.filter) delete q.filter;
    let temp = queryString.stringify(q);

    temp = `${temp}&sort=updatedAt,desc`;

    return temp;
  };

  return (
    <div className="explore-page">
      <div className="explore-page__title">Khám phá sách</div>
      <div className="explore-page__filters">
        <Input
          placeholder="Tìm theo tác giả"
          value={inputValue}
          onChange={handleAuthorChange}
          className="explore-page__filter-input"
        />
        <Select
          placeholder="Chọn thể loại"
          value={filters.category}
          onChange={handleCategoryChange}
          className="explore-page__filter-select"
          allowClear
          options={categories}
        />
      </div>
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
          <div className="explore-page__book-grid">
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
  );
};

export default ExplorePage;
