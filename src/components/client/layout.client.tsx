import { Layout } from "antd";
import Sidebar from "./sidebar.client";
import { Outlet } from "react-router-dom";
import Header from "./header.client";
import { useState, useEffect } from "react";
const { Content, Sider } = Layout;

const LayoutClient = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Tính toán margin-left và width cho sidebar
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    if (isTablet) return 80;
    return 240;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <Header />
      </Layout>

      <Layout>
        {!isMobile && (
          <Sider
            width={getSidebarWidth()}
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
        )}

        <Layout 
          style={{ 
            marginLeft: isMobile ? 0 : getSidebarWidth(),
            paddingBottom: isMobile ? 60 : 0 // Thêm padding bottom cho mobile để không bị che bởi bottom menu
          }} 
          className="client-layout"
        >
          <Content style={{ padding: "0 24px" }}>
            <Outlet />
          </Content>
        </Layout>

        {/* Render sidebar mobile ở đây để nó nằm ở bottom */}
        {isMobile && <Sidebar />}
      </Layout>
    </Layout>
  );
};

export default LayoutClient;