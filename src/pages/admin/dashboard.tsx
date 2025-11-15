import { Card, Col, Row, Statistic, DatePicker, Empty, Spin } from "antd";
import { useEffect, useState, useCallback } from "react";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { callGetDashboard, callStatisticsNewBook } from "api/services";
import { IDashboard, INewBook } from "@/types/backend";
import dayjs, { Dayjs } from "dayjs";

const DashboardPage = () => {
  const [data, setData] = useState<IDashboard>();
  const [statisticsData, setStatisticsData] = useState<INewBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  const formatter = (value: number | string) => {
    return <CountUp end={Number(value)} separator="," />;
  };

  const fetchDashboard = async () => {
    const res = await callGetDashboard();
    if (res && res.status === 200) {
      setData(res.data);
    }
  };

  const fetchStatistics = useCallback(async () => {
    if (!dateRange || dateRange.length !== 2) return;

    setLoading(true);
    try {
      const fromDate = dateRange[0].format("YYYY-MM-DD");
      const toDate = dateRange[1].format("YYYY-MM-DD");

      const res = await callStatisticsNewBook(fromDate, toDate);
      if (res && res.status === 200 && res.data) {
        setStatisticsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (dateRange && dateRange.length === 2) {
      void fetchStatistics();
    }
  }, [dateRange, fetchStatistics]);

  const chartData = statisticsData.map((item) => ({
    date: item.day,
    count: item.newBooks,
  }));

  return (
    <Row gutter={[20, 20]}>
      <Col span={24} md={8}>
        <Card title="Số người dùng" bordered={false}>
          <Statistic value={data?.totalUser} formatter={formatter} />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Số sách" bordered={false}>
          <Statistic value={data?.totalBook} formatter={formatter} />
        </Card>
      </Col>
      <Col span={24} md={8}>
        <Card title="Số đánh giá" bordered={false}>
          <Statistic value={data?.totalReview} formatter={formatter} />
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Thống kê sách mới" bordered={false}>
          <div style={{ marginBottom: 20 }}>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates.length === 2) {
                  setDateRange([dates[0]!, dates[1]!]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </div>

          <Spin spinning={loading}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#1890ff"
                    name="Sách mới"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Dữ liệu không sẵn sàng" />
            )}
          </Spin>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardPage;
