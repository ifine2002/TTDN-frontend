import { Layout } from "antd";
import Sidebar from "./sidebar.client";
import { Outlet } from "react-router-dom";
import Header from "./header.client";
const { Content, Sider } = Layout;

const LayoutClient = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Header />
      </Layout>

      <Layout>
        <Sider
          width={240}
          theme="light"
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 2,
          }}
        >
          <Sidebar />
        </Sider>

        <Layout style={{ marginLeft: 240 }} className="client-layout">
          <Content style={{ padding: "0 24px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutClient;
