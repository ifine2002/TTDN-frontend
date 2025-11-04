import { useRef, useEffect } from "react";
import { Row, Col, Spin, Empty, Button, InputNumber, Select } from "antd";
import BookCard from "./BookCard";
import SimpleBookCard from "./SimpleBookCard";
import { IPagination, IPost } from "types/backend";

interface IProps {
  books: IPost[];
  loading: boolean;
  pagination: IPagination;
  onLoadMore: () => void;
  simple?: boolean;
  onPageChange?: (page: number, pageSize: number) => void;
}

const BookList = ({
  books,
  loading,
  pagination,
  onLoadMore,
  simple,
  onPageChange,
}: IProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Thiết lập Intersection Observer khi component mount
  useEffect(() => {
    // Hủy observer cũ nếu có
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Tạo observer mới nếu có ref và còn trang để tải
    if (
      loadMoreRef.current &&
      pagination &&
      pagination.page <= pagination.totalPages
    ) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          // Nếu phần tử trong viewport và còn trang để tải và không đang tải
          if (
            entry.isIntersecting &&
            !loading &&
            pagination.page <= pagination.totalPages
          ) {
            console.log(
              "Load more element is visible, triggering load more..."
            );
            onLoadMore();
          }
        },
        {
          // Trigger khi phần tử hiển thị ít nhất 10% trong viewport
          threshold: 0.1,
          // Mở rộng vùng phát hiện 200px dưới viewport
          rootMargin: "0px 0px 200px 0px",
        }
      );

      // Bắt đầu quan sát phần tử
      observerRef.current.observe(loadMoreRef.current);
    }

    // Cleanup khi component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, pagination, onLoadMore]);

  if (!books || books.length === 0) {
    return (
      <div className="py-20">
        <Empty description="Không tìm thấy sách nào" />
      </div>
    );
  }

  // Xác định nếu còn dữ liệu để tải
  const hasMoreData = pagination && pagination.page <= pagination.totalPages;
  if (simple) {
    // Phân trang dạng custom
    const { page, pageSize, totalElements } = pagination || {};
    const totalPages = pagination?.totalPages || 1;
    const from = totalElements === 0 ? 0 : pageSize * (page - 1) + 1;
    const to = Math.min(page * pageSize, totalElements);
    const pageOptions = [4, 8, 12, 16, 20];

    const handlePageChange = (value: number | null) => {
      if (onPageChange && value !== null) {
        onPageChange(value, pageSize);
      }
    };

    const handlePageSizeChange = (value: number) => {
      if (onPageChange) {
        onPageChange(1, value); // reset về trang 1 khi đổi pageSize
      }
    };

    return (
      <div>
        <div className="w-full overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {books.map((book, index) => (
              <div
                key={`${book.bookId}-${index}`}
                className="w-[200px] flex-shrink-0"
              >
                <SimpleBookCard book={book} />
              </div>
            ))}
          </div>
        </div>
        {/* Phân trang custom */}
        <div className="flex items-center justify-between mt-6 px-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Hiển thị:</span>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              size="small"
              style={{ width: 90 }}
            >
              {pageOptions.map((opt) => (
                <Select.Option key={opt} value={opt}>
                  {opt} sách
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {from}-{to} trên {totalElements} sách
            </span>
            <div className="flex items-center gap-2">
              <Button
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
                style={{ width: 60 }}
                size="small"
              />
              <Button
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
  // layout mặc định (dọc)
  return (
    <div>
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          {books.map((book, index) => (
            <BookCard key={`${book.bookId}-${index}`} book={book} />
          ))}
          {/* Load more trigger element */}
          <div
            ref={loadMoreRef}
            className="w-full flex justify-center py-6 mt-4"
            style={{ minHeight: "100px" }}
          >
            {loading ? (
              <Spin size="large" tip="Đang tải sách..." />
            ) : hasMoreData ? (
              <Button
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
            ) : books.length > 0 ? (
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
