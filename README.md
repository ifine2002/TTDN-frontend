# Ứng Dụng Đánh Giá Sách - Frontend

## Giới thiệu

Đây là ứng dụng frontend cho hệ thống đánh giá sách, được xây dựng bằng React và Vite. Ứng dụng cho phép người dùng khám phá, đánh giá, bình luận và chia sẻ sách với cộng đồng.

## Giới Môi trường chạy dự án: Node.js v20.14.0

https://nodejs.org/download/release/v20.14.0/

## Tính năng chính

- **Quản lý tài khoản**: Đăng ký, đăng nhập, xác thực email, quên mật khẩu, đặt lại mật khẩu
- **Quản lý sách**: Tìm kiếm, xem chi tiết, đăng tải sách mới
- **Tương tác**: Đánh giá, bình luận, theo dõi người dùng, yêu thích sách
- **Trang cá nhân**: Xem và chỉnh sửa thông tin cá nhân
- **Quản trị viên**: Quản lý người dùng, sách, phân quyền, duyệt sách

## Công nghệ sử dụng

- **React 18**: Thư viện UI
- **Vite**: Công cụ build nhanh
- **React Router 6**: Điều hướng
- **Redux Toolkit**: Quản lý state
- **Ant Design**: UI component
- **Axios**: Gọi API
- **React Hook Form**: Xử lý form
- **TailwindCSS**: Styling

## Cài đặt

1. Clone dự án:

```bash
git clone <repository-url>
cd frontend-book-rating
```

2. Cài đặt các gói phụ thuộc:

```bash
npm install
```

3. Chạy ứng dụng ở môi trường phát triển:

```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Cấu trúc dự án

- `/src/api`: Các service gọi API
- `/src/assets`: Tài nguyên tĩnh (hình ảnh, font, ...)
- `/src/components`: Các component UI
- `/src/hooks`: Custom hooks
- `/src/pages`: Các trang của ứng dụng
- `/src/redux`: State management với Redux Toolkit
- `/src/styles`: Global styles
- `/src/utils`: Các hàm tiện ích

## Môi trường

Ứng dụng hỗ trợ các môi trường:

- Development: `npm run dev`
- Production: `npm run build` và `npm run preview`

## API Backend

Ứng dụng này kết nối với backend thông qua RESTful API. Đảm bảo backend đang chạy trước khi sử dụng các tính năng đầy đủ của ứng dụng.
