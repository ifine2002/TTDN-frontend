import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardPage from "./pages/admin/dashboard";
import NotFound from "./components/share/notfound";
import LayoutAdmin from "./components/admin/AdminLayout";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import { fetchAccount } from "./redux/slice/accountSlice";
import UserPage from "./pages/admin/user";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import PermissionPage from "./pages/admin/permission";
import RolePage from "./pages/admin/role";
import styles from "./styles/app.module.scss";
import CategoryPage from "./pages/admin/category";
import BookPage from "./pages/admin/book";
import ApprovalBooksPage from "./pages/admin/approval-books";
import FollowPage from "./pages/admin/follow";
import RatingPage from "./pages/admin/rating";
import CommentPage from "./pages/admin/comment";
import LayoutClient from "./components/client/ClientLayout";
import BookDetailPage from "./pages/client/BookDetailPage";
import HomePage from "./pages/client/HomePage";
import UploadBookPage from "./pages/client/UploadBook";
import SearchPage from "./pages/client/SearchPage";
import ProfilePage from "./pages/client/ProfilePage";
import MyProfile from "./pages/client/MyProfile";
import VerifyEmailPage from "./pages/auth/verify-email";
import ExplorePage from "./pages/client/ExplorePage";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import LayoutApp from "./components/share/layout.app";

export default function App() {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) {
      dispatch(fetchAccount());
    }
  }, [dispatch, token]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "book/:id",
          element: <BookDetailPage />,
        },
        {
          path: "/search",
          element: <SearchPage />,
        },
        {
          path: "/create",
          element: <UploadBookPage />,
        },
        {
          path: "/profile/:id",
          element: <ProfilePage />,
        },
        {
          path: "/my-profile",
          element: <MyProfile />,
        },
        {
          path: "/explore",
          element: <ExplorePage />,
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <LayoutApp>
          <LayoutAdmin />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "user",
          element: <UserPage />,
        },
        {
          path: "book",
          element: <BookPage />,
        },
        {
          path: "approval-books",
          element: <ApprovalBooksPage />,
        },
        {
          path: "permission",
          element: <PermissionPage />,
        },
        {
          path: "role",
          element: <RolePage />,
        },
        {
          path: "category",
          element: <CategoryPage />,
        },
        {
          path: "follow",
          element: <FollowPage />,
        },
        {
          path: "rating",
          element: <RatingPage />,
        },
        {
          path: "comment",
          element: <CommentPage />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/verify-email",
      element: <VerifyEmailPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/reset-password",
      element: <ResetPasswordPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
