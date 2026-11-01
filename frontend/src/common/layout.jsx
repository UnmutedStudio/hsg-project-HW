import {
  FaLock,
  FaDumbell,
  FaCalendarCheck,
  FaComments,
} from "react-icons/fa";
import { Outlet, useNavigate, useLocation } from "react-router";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="max-w-[430px] min-h-screen mx-auto shadow">
      <header className="navbar justify-between bg-base-100 shadow-md">
        <button onClick={() => navigate("/")} className="btn btn-ghost text-lg">
          High Street Gym
        </button>
        <button
          onClick={() => navigate("/login")}
          className="btn btn-ghost text-lg"
        >
          <FaLock className="text-red-500" />
        </button>
      </header>
      <Outlet />
      <nav className="dock max-w-[430px] mx-auto">
        <button
          onClick={() => navigate("/")}
          className={location.pathname == "/" ? "dock-active" : ""}
        >
          <FaDumbell className="text-2xl" />
          <span className="dock-label">Sessions</span>
        </button>
        <button
          onClick={() => navigate("/bookings")}
          className={
            location.pathname.startsWith("/bookings") ? "dock-active" : ""
          }
        >
          <FaCalendarCheck className="text-2xl" />
          <span className="dock-label">Bookings</span>
        </button>
        <button>
          <FaComments className="text-2xl" />
          <span className="dock-label">Blog</span>
        </button>
      </nav>
    </main>
  );
}

export default Layout;
