
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeedChart from '../Chart/FeedChart';
import { getDashboardTypeData } from '../../services/emonAPI';

const DashboardView = () => {
  const { type } = useParams(); // Get the dynamic "type" parameter from the URL
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [chartData, setChartData] = useState(null); // Chart data state
  const [timeRange, setTimeRange] = useState('1m');

  console.log('DashboardView type:', type); // Log the type parameter for debugging
  const fetchDashboardData = async (selectedTimeRange) => {
    try {
      setLoading(true);
      const data = await getDashboardTypeData(type,selectedTimeRange); // Appel API avec le timeRange
      setChartData(data); // Met à jour les données du graphique
      setLoading(false);
    } catch (err) {
      setError(`Failed to load data for dashboard: ${type}`); // Définit le message d'erreur
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange); // Appelle la fonction avec le timeRange actuel
  }, [type] );

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-view">
      <div className="feeds-chart-area">
        <div className="chart-container">
          <h2 className="dashboard-title">{type}</h2> {/* Display the dashboard name */}
          <div className="time-range-selector">
            {['24h', '1w', '1m', 'y'].map((range) => (
              <button
                key={range}
                className={`time-range-option ${timeRange === range ? 'active' : ''}`}
                onClick={() => {
                  setTimeRange(range);
                  fetchDashboardData(range);
                }}
              >
                {range}
              </button>
            ))}
          </div>
          <FeedChart
            data={chartData.datasets.map((d) => ({
              label: d.label,
              data: d.data,
            }))}
            feedName={type} // Use the "type" as the feed name
            timeRange={timeRange} // Pass the selected time range to the chart
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;