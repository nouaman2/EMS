import {Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Add as ExtrasIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  BarChart as VisualizationIcon,
  Email as EmailIcon,
  Input as InputIcon,
  Storage as FeedsIcon,
  ShowChart as GraphsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const handleLogout = () => {
    // Remove authentication status from localStorage
    localStorage.removeItem('isAuthenticated');
    // Redirect to login page
    window.location.href = '/login'; // Using window.location to force a full page reload
  };

  const extrasItems = [
    { text: 'Schedule', icon: <ScheduleIcon />, path: '/extras/schedule' },
    { text: 'Event', icon: <EventIcon />, path: '/extras/event' },
    { text: 'Visualization', icon: <VisualizationIcon />, path: '/extras/visualization' },
    { text: 'Email Reports', icon: <EmailIcon />, path: '/extras/email-reports' },
  ];

  const setupItems = [
    { text: 'Inputs', icon: <InputIcon />, path: '/setup/inputs' },
    { text: 'Feeds', icon: <FeedsIcon />, path: '/setup/feeds' },
    { text: 'Graphs', icon: <GraphsIcon />, path: '/setup/graphs' },
    { text: 'Dashboards', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <button className="sidebar-item" onClick={() => navigate('/dashboard')}>
          <DashboardIcon />
          <span>Dashboards</span>
        </button>

        <div className="sidebar-group">
          <button className="sidebar-item" onClick={() => setExtrasOpen(!extrasOpen)}>
            <ExtrasIcon />
            <span>Extras</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{extrasOpen ? <ExpandLess /> : <ExpandMore />}
          </button>
          
          {extrasOpen && (
            <div className="sidebar-submenu">
              {extrasItems.map((item) => (
                <button
                  key={item.text}
                  className="sidebar-item submenu-item"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-group">
          <button className="sidebar-item" onClick={() => setSetupOpen(!setupOpen)}>
            <SettingsIcon />
            <span>Setup</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{setupOpen ? <ExpandLess /> : <ExpandMore />}
          </button>
          
          {setupOpen && (
            <div className="sidebar-submenu">
              {setupItems.map((item) => (
                <button
                  key={item.text}
                  className="sidebar-item submenu-item"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 