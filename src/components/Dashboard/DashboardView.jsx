import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeedChart from '../Chart/FeedChart';
import { getDashboardTypeData, getFeedData } from '../../services/emonAPI';

const DashboardView = () => {
  const { type } = useParams(); // Get the dynamic "type" parameter from the URL
  const [loading, setLoading] = useState(true); // Loading state for Multipuissance
  const [tensionLoading, setTensionLoading] = useState(true); // Loading state for TENSION
  const [error, setError] = useState(null); // Error state
  const [chartData, setChartData] = useState(null); // Chart data state for Multipuissance
  const [tensionData, setTensionData] = useState(null); // Chart data state for TENSION
  const [timeRange, setTimeRange] = useState('1m'); // Time range state

  console.log('DashboardView type:', type); // Log the type parameter for debugging

  const timeRanges = {
  '24h': 'D',
  '1w': 'W',
  '1m': 'M',
  'y': 'Y'
};
  // Function to fetch Multipuissance data
  const fetchDashboardData = async (selectedTimeRange) => {
    try {
      setLoading(true);
      const data = await getDashboardTypeData(type, selectedTimeRange); // Fetch Multipuissance data
      setChartData(data); // Update Multipuissance chart data
      setLoading(false);
    } catch (err) {
      setError(`Failed to load data for dashboard: ${type}`);
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  // Function to fetch TENSION data
  const fetchTensionData = async (selectedTimeRange) => {
    try {
      setTensionLoading(true);
      const data = await getFeedData(28, selectedTimeRange); // Fetch TENSION data using feedId 28
      setTensionData(data); // Update TENSION chart data
      setTensionLoading(false);
    } catch (err) {
      setError('Failed to load TENSION data');
      setTensionLoading(false);
      console.error('Error fetching TENSION data:', err);
    }
  };

  // Fetch data when the component mounts or when the time range changes
  useEffect(() => {
    fetchDashboardData(timeRange); // Fetch Multipuissance data
    if (type !== 'Multicourants') {
      fetchTensionData(timeRange); // Fetch TENSION data only if not Multicourants
    }
  }, [type, timeRange]);

  if (loading || (type !== 'Multicourants' && tensionLoading)) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-view">
      <div className="feeds-chart-area">
        <div className="chart-container">
          <div className="time-range-selector">
            {Object.entries(timeRanges).map(([value, label]) => (
              <button
                key={value}
                className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                onClick={() => setTimeRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Multipuissance Chart */}
          <FeedChart
            data={chartData.datasets.map((d) => ({
              label: d.label,
              data: d.data,
            }))}
            feedName={type} // Use the "type" as the feed name
            timeRange={timeRange} // Pass the selected time range to the chart
          />
        </div>

        {/* Conditionally Render TENSION Chart */}
        {type == '1_MULTIPUISSANCES' && (
          <div className="chart-container">
            <FeedChart
              data={tensionData}
              feedName="TENSION" // Use "TENSION" as the feed name
              timeRange={timeRange} // Pass the selected time range to the chart
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;