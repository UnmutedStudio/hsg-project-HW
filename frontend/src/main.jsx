import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./common/Layout";
import SessionListView from "./sessions/SessionListView";
import BookingsListView from "./bookings/BookingsListView";
import BookingCreateView from "./bookings/BookingCreateView";
import LoginView from "./authentication/LoginView";

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
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
