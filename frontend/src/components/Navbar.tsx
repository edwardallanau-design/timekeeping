import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout, isDeveloper } = useAuth();

  const roleLabel = (role: string): string => {
    if (isDeveloper) return 'Developer';
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Clock size={20} strokeWidth={2} />
        <span>Timekeeping</span>
      </div>

      {user && (
        <div className="navbar-right">
          <div className="navbar-user">
            <span className="navbar-name">{user.name}</span>
            <span className={`navbar-role role-${user.role.toLowerCase()}`}>
              {roleLabel(user.role)}
            </span>
          </div>
          <button onClick={logout} className="navbar-logout-btn">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
