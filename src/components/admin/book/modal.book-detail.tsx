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
      title="Book Detail"
      open={openViewDetail}
      onCancel={() => setOpenViewDetail(false)}
      footer={[
        <Button key="back" onClick={() => setOpenViewDetail(false)}>
          Close
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
          Approval
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
          Reject
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
                <Descriptions.Item label="Author">
                  {bookDetail.author || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Published Date">
                  {bookDetail.publishedDate
                    ? dayjs(bookDetail.publishedDate).format("DD/MM/YYYY")
                    : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Book Format">
                  {bookDetail.bookFormat || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Language">
                  {bookDetail.language || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Categories">
                  {bookDetail.categories && bookDetail.categories.length > 0
                    ? bookDetail.categories.map((cat) => (
                        <Tag key={cat.id} color="blue">
                          {cat.name}
                        </Tag>
                      ))
                    : "No categories"}
                </Descriptions.Item>
                <Descriptions.Item label="Book Sale Link">
                  {bookDetail.bookSaleLink ? (
                    <a
                      href={bookDetail.bookSaleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {bookDetail.bookSaleLink}
                    </a>
                  ) : (
                    "No book sale link"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Description:</h3>
            <div className="p-4 border rounded bg-gray-50">
              {bookDetail.description || "No description"}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Information Poster:</h3>
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
                  Posted at:{" "}
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
