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
    fetchTensionData(timeRange); // Fetch TENSION data
  }, [type, timeRange]);

  if (loading || tensionLoading) return <div className="loading">Loading dashboard...</div>;
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
                onClick={() => setTimeRange(range)} // Update the time range
              >
                {range}
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

        {/* TENSION Chart */}
        <div className="chart-container">
          <h2 className="dashboard-title">TENSION</h2> {/* Display the TENSION title */}
          <FeedChart
            data={tensionData}
            feedName="TENSION" // Use "TENSION" as the feed name
            timeRange={timeRange} // Pass the selected time range to the chart
          /> 
        </div>
      </div>
    </div>
  );
};

export default DashboardView;