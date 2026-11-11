import {
  FaLock,
  FaDumbbell,
  FaCalendarCheck,
  FaComments,
  FaClipboardList,
  FaUser,
} from 'react-icons/fa';
import { TbFileDownload, TbLogout } from 'react-icons/tb';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthenticate } from '../authentication/useAuthenticate';
import XMLDownloadButton from "./XMLDownloadButton";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthenticate();

  return (
    <main className="w-full sm:max-w-[640px] lg:max-w-[768px] min-h-screen mx-auto bg-base-200 shadow-xl">
      <header className="navbar bg-primary text-primary-content shadow-md">
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn btn-ghost text-3xl font-bold text-white"
          >
            High Street Gym
          </button>
        </div>
      </header>
      <div className="w-full max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
        <div className="h-28" aria-hidden="true"></div>
      </div>
      <nav className="dock fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full sm:max-w-[640px] lg:max-w-[768px] bg-secondary text-secondary-content">
        {user && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className={location.pathname === "/" ? "dock-active" : ""}
          >
            <FaDumbbell className="text-2xl" />
            <span className="dock-label">Timetable</span>
          </button>
        )}
        {user && user.role == "trainer" && (
          <button
            onClick={() => navigate("/trainer/sessions")}
            className={
              location.pathname.startsWith("/trainer/sessions")
                ? "dock-active"
                : ""
            }
          >
            <FaClipboardList className="text-2xl" />
            <span className="dock-label">My sessions</span>
          </button>
        )}
        {user && user.role == "member" && (
          <button
            onClick={() => navigate("/bookings")}
            className={
              location.pathname.startsWith("/bookings")
                ? "dock-active"
                : ""
            }
          >
            <FaCalendarCheck className="text-2xl" />
            <span className="dock-label">Bookings</span>
          </button>
        )}
        <button
          onClick={() => navigate('/blog')}
          className={location.pathname.startsWith('/blog') ? 'dock-active' : ''}
        >
          <FaComments className="text-2xl" />
          <span className="dock-label">Blog</span>
        </button>
        {user && (
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={
            location.pathname.startsWith("/profile") ? "dock-active" : ""
          }
        >
        <FaUser className="text-2xl" />
          <span className="dock-label">Profile</span>
        </button>
        )}
          {user && user.role == "member" && (
            <XMLDownloadButton
              route="/bookings/xml"
              filename="member-bookings.xml"
              authenticationKey={user && user.authenticationKey}
              disabled={!location.pathname.startsWith("/bookings")}
              className={
                location.pathname.startsWith("/bookings")
                  ? "dock-item"
                  : "dock-item opacity-40 pointer-events-none"
              }
            >
              <TbFileDownload className="text-2xl" />
              <span className="dock-label">Export</span>
            </XMLDownloadButton>
          )}
          {user && user.role == "trainer" && (
            <XMLDownloadButton
              route="/sessions/xml"
              filename="trainer-sessions.xml"
              authenticationKey={user && user.authenticationKey}
              disabled={!location.pathname.startsWith("/trainer/sessions")}
              className={
                location.pathname.startsWith("/trainer/sessions")
                  ? "dock-item"
                  : "dock-item opacity-40 pointer-events-none"
              }
            >
              <TbFileDownload className="text-2xl" />
              <span className="dock-label">Export</span>
            </XMLDownloadButton>
          )}
      {user ? (
        <button type="button" onClick={() => logout()}>
          <TbLogout className="text-2xl" />
          <span className="dock-label">Logout</span>
        </button>
        ) : (
          <button type="button" onClick={() => navigate("/login")}>
            <FaLock className="text-2xl" />
            <span className="dock-label">Login</span>
          </button>
        )}
        </nav>
    </main>
  );
}

export default Layout;
