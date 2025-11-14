import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Spin, Empty, Button, InputNumber, Select } from "antd";
import BookCard from "./BookCard";
import SimpleBookCard from "./SimpleBookCard";
import { IBookSearch, IPagination, IPost } from "types/backend";

const PAGE_OPTIONS = [4, 8, 12, 16, 20];

interface IProps {
  favoriteBooks?: IBookSearch[];
  books?: IPost[];
  loading: boolean;
  pagination: IPagination;
  onLoadMore: () => void;
  simple?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
}

const BookList: React.FC<IProps> = (props) => {
  const {
    favoriteBooks,
    books,
    loading,
    pagination,
    onLoadMore,
    simple,
    onPageChange,
  } = props;

  // Refs for IntersectionObserver
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<boolean>(loading);
  const pageRef = useRef<number>(pagination?.page ?? 1);
  const totalPagesRef = useRef<number>(pagination?.totalPages ?? 1);

  // Keep refs in-sync with latest props
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    pageRef.current = pagination?.page ?? 1;
  }, [pagination?.page]);
  useEffect(() => {
    totalPagesRef.current = pagination?.totalPages ?? 1;
  }, [pagination?.totalPages]);

  // Create observer once. Read latest state from refs to avoid stale closures.
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    const target = loadMoreRef.current;
    if (!target) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const hasMore = pageRef.current < totalPagesRef.current;
        if (entry.isIntersecting && !loadingRef.current && hasMore) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1, // trigger when 10% is visible
        rootMargin: "0px 0px 200px 0px", // preload 200px before viewport bottom
      }
    );

    observerRef.current.observe(target);
    return () => observerRef.current?.disconnect();
  }, [onLoadMore]);

  // Derived values
  const noBooks = useMemo(() => {
    const hasBooks = Array.isArray(books) && books.length > 0;
    const hasFavs = Array.isArray(favoriteBooks) && favoriteBooks.length > 0;
    return !hasBooks && !hasFavs;
  }, [books, favoriteBooks]);

  const hasMoreData = useMemo(() => {
    return !!pagination && pagination.page < pagination.totalPages;
  }, [pagination]);

  // Handlers for simple pagination mode
  const handlePageChange = useCallback(
    (value: number | null) => {
      if (!onPageChange || value == null) return;
      const page = pagination?.page ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const totalPages = pagination?.totalPages ?? 1;
      const next = Math.min(Math.max(1, value), totalPages);
      if (next !== page) onPageChange(next, pageSize);
    },
    [
      onPageChange,
      pagination?.page,
      pagination?.pageSize,
      pagination?.totalPages,
    ]
  );

  const handlePageSizeChange = useCallback(
    (value: number) => {
      if (!onPageChange) return;
      const size = Math.max(1, value || (pagination?.pageSize ?? 10));
      onPageChange(1, size); // reset to page 1 on size change
    },
    [onPageChange, pagination?.pageSize]
  );

  if (noBooks) {
    return (
      <div className="py-20">
        <Empty description="Không tìm thấy sách nào" />
      </div>
    );
  }

  if (simple) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const totalElements = pagination?.totalElements ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    const from = totalElements === 0 ? 0 : pageSize * (page - 1) + 1;
    const to = Math.min(page * pageSize, totalElements);

    return (
      <div>
        {/* Horizontal scroll of favorites */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {favoriteBooks?.map((book) => (
              <div key={book.id} className="w-[200px] flex-shrink-0">
                <SimpleBookCard book={book} />
              </div>
            ))}
          </div>
        </div>

        {/* Custom pagination */}
        <div className="flex items-center justify-between mt-6 px-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Hiển thị:</span>
            <Select
              size="small"
              style={{ width: 100 }}
              value={pageSize}
              onChange={handlePageSizeChange}
              options={PAGE_OPTIONS.map((opt) => ({
                value: opt,
                label: `${opt} sách`,
              }))}
              aria-label="Chọn số sách trên mỗi trang"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {from}-{to} trên {totalElements} sách
            </span>
            <div className="flex items-center gap-2">
              <Button
                aria-label="Trang trước"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                size="small"
              >
                Trước
              </Button>
              <InputNumber
                min={1}
                max={totalPages}
                value={page}
                onChange={handlePageChange}
                style={{ width: 70 }}
                size="small"
                aria-label="Nhập số trang"
              />
              <Button
                aria-label="Trang sau"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                size="small"
              >
                Sau
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="w-full flex justify-center py-6 mt-4">
            <Spin size="large" tip="Đang tải sách..." />
          </div>
        )}
      </div>
    );
  }

  // Default vertical layout with infinite scroll
  return (
    <div>
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={20} xxl={18}>
          {books?.map((book) => (
            <BookCard key={book.bookId} book={book} />
          ))}

          {/* Load more trigger element */}
          <div
            ref={loadMoreRef}
            className="w-full flex justify-center py-6 mt-4"
            style={{ minHeight: 100 }}
          >
            {loading ? (
              <Spin size="large" tip="Đang tải sách..." />
            ) : hasMoreData ? (
              <Button
                aria-label="Tải thêm sách"
                onClick={(e) => {
                  e.preventDefault();
                  onLoadMore();
                }}
                type="primary"
                ghost
                size="large"
                className="load-more-button"
              >
                Tải thêm ({pagination.page}/{pagination.totalPages})
              </Button>
            ) : books && books.length > 0 ? (
              <div className="text-gray-500 text-center">
                Bạn đã xem hết tất cả sách
              </div>
            ) : null}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BookList;
