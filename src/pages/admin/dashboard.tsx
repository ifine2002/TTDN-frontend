import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { callGetDashboard } from "api/services";
import { IDashboard } from "@/types/backend";

const DashboardPage = () => {
  const [data, setData] = useState<IDashboard>();

  const formatter = (value: number | string) => {
    return <CountUp end={Number(value)} separator="," />;
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await callGetDashboard();
    if (res && res.status === 200) {
      setData(res.data);
    }
  };

  return (
    <Row gutter={[20, 20]}>
      <Col span={24} md={8}>
        <Card title="Total Users" bordered={false}>
          <Statistic
            // title="Total Users"
            value={data?.totalUser}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Total Books" bordered={false}>
          <Statistic
            // title="Total Books"
            value={data?.totalBook}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Total Reviews" bordered={false}>
          <Statistic
            // title="Total Reviews"
            value={data?.totalReview}
            formatter={formatter}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardPage;
