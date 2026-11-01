import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./common/Layout";
import SessionListView from "./sessions/SessionListView";
import BookingCreateView from "./bookings/BookingCreateView";
import LoginView from "./authentication/LoginView";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)




const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        Component: ProductListView,
      },

      {
        path: "/sales",
        Component: ProductSalesView,
      },
      {
        path: "/checkout/:productId",
        Component: ProductCheckoutView,
      },
      {
        path: "/staff/login",
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
