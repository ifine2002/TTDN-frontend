import { IBookAdmin } from "@/types/backend";
import { Button, Tag, Image, Descriptions, Modal } from "antd";
import dayjs from "dayjs";

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  bookDetail: IBookAdmin | null;
  handleApproveBook: (v: number) => void;
  handleRejectBook: (v: number) => void;
}
const BookDetailModal = (props: IProps) => {
  const {
    openViewDetail,
    setOpenViewDetail,
    bookDetail,
    handleApproveBook,
    handleRejectBook,
  } = props;

  return (
    <Modal
      title="Chi Tiết Thông Tin Sách"
      open={openViewDetail}
      onCancel={() => setOpenViewDetail(false)}
      footer={[
        <Button key="back" onClick={() => setOpenViewDetail(false)}>
          Đóng
        </Button>,
        <Button
          key="approve"
          type="primary"
          style={{ backgroundColor: "#52c41a" }}
          onClick={() => {
            if (bookDetail?.bookId) {
              handleApproveBook(bookDetail.bookId);
              setOpenViewDetail(false);
            }
          }}
        >
          Chấp thuận
        </Button>,
        <Button
          key="reject"
          danger
          onClick={() => {
            if (bookDetail?.bookId) {
              handleRejectBook(bookDetail.bookId);
              setOpenViewDetail(false);
            }
          }}
        >
          Từ chối
        </Button>,
      ]}
      width={800}
      getContainer={false}
    >
      {bookDetail && (
        <div className="book-detail">
          <div className="flex mb-4">
            <div className="mr-4 flex justify-center items-center">
              <Image
                width={200}
                src={bookDetail.imageBook}
                alt={bookDetail.bookName}
              />
            </div>
            <div className="flex-1">
              <Descriptions title={bookDetail.bookName} column={1} bordered>
                <Descriptions.Item label="Tác giả">
                  {bookDetail.author || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày xuất bản">
                  {bookDetail.publishedDate
                    ? dayjs(bookDetail.publishedDate).format("DD/MM/YYYY")
                    : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Định dạng">
                  {bookDetail.bookFormat || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngôn ngữ">
                  {bookDetail.language || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Thể loại">
                  {bookDetail.categories && bookDetail.categories.length > 0
                    ? bookDetail.categories.map((cat) => (
                        <Tag key={cat.id} color="blue">
                          {cat.name}
                        </Tag>
                      ))
                    : "No categories"}
                </Descriptions.Item>
                <Descriptions.Item label="Liên kết mua sách">
                  {bookDetail.bookSaleLink ? (
                    <a
                      href={bookDetail.bookSaleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {bookDetail.bookSaleLink}
                    </a>
                  ) : (
                    "Không có địa chỉ liên kết"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Mô tả:</h3>
            <div className="p-4 border rounded bg-gray-50">
              {bookDetail.description || "Không có mô tả"}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Thông tin người đăng:</h3>
            <div className="flex items-center gap-4">
              <Image
                width={50}
                height={40}
                src={
                  bookDetail.avatar ||
                  "http://localhost:9000/book-rating/avatar.jpg"
                }
                alt="user avatar"
                style={{ borderRadius: "50%", marginRight: "12px" }}
              />
              <div>
                <div className="font-bold">{bookDetail.fullName}</div>
                <div className="text-gray-500">
                  Đăng tải lúc:{" "}
                  {dayjs(bookDetail.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookDetailModal;
