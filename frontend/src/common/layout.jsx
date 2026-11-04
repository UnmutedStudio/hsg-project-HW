import {
  FaLock,
  FaDumbbell,
  FaCalendarCheck,
  FaComments,
} from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthenticate } from '../authentication/useAuthenticate';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthenticate();

  return (
    <main className="max-w-[430px] min-h-screen mx-auto shadow">
      <header className="navbar justify-between bg-base-100 shadow-md">
        <button onClick={() => navigate('/')} className="btn btn-ghost text-lg">
          High Street Gym
        </button>
        {user ? (
          <button onClick={() => logout()} className="btn btn-ghost text-lg">
            <TbLogout />
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost text-lg"
          >
            <FaLock className="text-red-500" />
          </button>
        )}
      </header>
      <Outlet />
      <nav className="dock max-w-[430px] mx-auto">
        <button
          onClick={() => navigate('/')}
          className={location.pathname === '/' ? 'dock-active' : ''}
        >
          <FaDumbbell className="text-2xl" />
          <span className="dock-label">Sessions</span>
        </button>
        <button
          disabled={!(user && user.role == 'member')}
          onClick={() => navigate('/bookings')}
          className={
            location.pathname.startsWith('/bookings') ? 'dock-active' : ''
          }
        >
          <FaCalendarCheck className="text-2xl" />
          <span className="dock-label">Bookings</span>
        </button>
        <button
          onClick={() => navigate('/blog')}
          className={location.pathname.startsWith('/blog') ? 'dock-active' : ''}
        >
          <FaComments className="text-2xl" />
          <span className="dock-label">Blog</span>
        </button>
      </nav>
    </main>
  );
}

export default Layout;
