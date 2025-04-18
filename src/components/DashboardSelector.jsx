import { useState, useEffect } from 'react';
import { getDashboardList } from '../services/emonAPI';
import { multiPuissanceConfig } from './Dashboard/dashboardTypes/multiPuissance';
import { dashboardConfigs } from './Dashboard/dashboardTypes/multiPuissance'

const DashboardSelector = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleDashboardChange = (e) => {
  const dashboardId = e.target.value;
  if (dashboardConfigs[dashboardId]) {
    window.location.href = `/dashboard/${dashboardId}`;
  } else if (dashboardId) {
    window.open(`http://electricwave.ma/energymonitoring/dashboard/view?id=${dashboardId}`, '_blank');
  }
  };
  

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        setLoading(true);
        const data = await getDashboardList();
        setDashboards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);


  return (
    <div className="dashboard-selector">
      <select
        className="dashboard-select"
        onChange={handleDashboardChange}
        defaultValue=""
        disabled={loading}
      >
        <option value="" disabled>Select Dashboard</option>
        {dashboards.map((dashboard) => (
          <option key={dashboard.id} value={dashboard.name}>
            {dashboard.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DashboardSelector;