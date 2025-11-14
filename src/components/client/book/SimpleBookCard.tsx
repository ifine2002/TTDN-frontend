import { IBookSearch } from "@/types/backend";
import { Card, Rate, Typography } from "antd";
import { Link } from "react-router-dom";

const { Meta } = Card;
const { Text } = Typography;

const SimpleBookCard = ({ book }: { book: IBookSearch }) => {
  const defaultImage = "https://placehold.co/300x400?text=No+Image";

  return (
    <Link to={`/book/${book.id}`} style={{ textDecoration: "none", display: "block", width: "100%" }}>
      <Card
        hoverable
        cover={
          <img
            alt={book.name}
            src={book.image || defaultImage}
            style={{ height: 220, objectFit: "cover", width: "100%" }}
          />
        }
        style={{ width: "100%", maxWidth: 180, margin: "0 auto" }}
        bodyStyle={{ padding: 12 }}
      >
        <Meta
          title={
            <Text ellipsis style={{ width: "100%" }}>
              {book.name}
            </Text>
          }
          description={
            <div style={{ marginTop: 8 }}>
              <Rate
                allowHalf
                disabled
                value={book?.averageRating || 0}
                style={{ fontSize: 16 }}
              />
              <span style={{ marginLeft: 8, color: "#888" }}>
                {book?.averageRating ? book?.averageRating.toFixed(1) : "0.0"}
              </span>
            </div>
          }
        />
      </Card>
    </Link>
  );
};

export default SimpleBookCard;
