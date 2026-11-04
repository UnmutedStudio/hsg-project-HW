import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./common/Layout";
import SessionListView from "./sessions/SessionListView";
import BookingsListView from "./bookings/BookingsListView";
import BookingCreateView from "./bookings/BookingCreateView";
import LoginView from "./authentication/LoginView";
import { AuthenticationProvider } from "./authentication/useAuthenticate";
import TrainerSessionListView from "./sessions/TrainerSessionListView";
import BlogListView from "./blog/BlogListView";
import BlogCreateView from "./blog/BlogCreateView";
import UserDetailsView from "./users/UserDetailsView";


const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        Component: SessionListView,
      },

      {
        path: "/bookings",
        Component: BookingsListView,
      },
      {
        path: "/bookings/create/:sessionId",
        Component: BookingCreateView,
      },
      {
        path: "/login",
        Component: LoginView,
      },
      {
        path: "/trainer/sessions",
        Component: TrainerSessionListView,
      },
      {
        path: "/blog",
        Component: BlogListView,
      },
      {
        path: "/blog/create",
        Component: BlogCreateView,
      },
      {
        path: "/profile",
        Component: UserDetailsView,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthenticationProvider>
      <RouterProvider router={router} />
    </AuthenticationProvider>
  </StrictMode>,
);
