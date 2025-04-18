/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import '../../styles/feed-chart.css';

const FeedChart = ({ data, feedName }) => {
  //console.log('FeedChart received data:', data);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('1w');

  const chartTypes = [
    {
      id: 'line',
      name: 'Line Chart',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTYgMTEuNzhsNC4yNC00LjI0IDEuNDEgMS40MUwxNiAxNC42NWwtNC0zLjk5LTQuMjQgNC4yNEw2LjM0IDEzLjQ5IDIuMSAxNy43bC0xLjQxLTEuNDFMNS45MyAxMmw0LjI0IDQuMjQgNC0zLjk5TDE3LjQxIDguMzUgMjEuNjYgNC4xbDEuNDEgMS40MUwxNiAxMS43OHoiLz48L3N2Zz4=',
      description: 'Ligne simple'
    },
    {
      id: 'scatter',
      name: 'Scatter Plot',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjE5IiBjeT0iNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjE0IiBjeT0iMTUiIHI9IjIiLz48Y2lyY2xlIGN4PSI5IiBjeT0iMTIiIHI9IjIiLz48Y2lyY2xlIGN4PSI3IiBjeT0iMTkiIHI9IjIiLz48L3N2Zz4=',
      description: 'Nuage de points'
    },
    {
      id: 'bar',
      name: 'Bar Chart',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNSAyMHYtMTZoM3YxNmgzdjE2aC0zem03IDBoLTN2LTE2aDN2MTZ6Ii8+PC9zdmc+',
      description: 'Barres verticales'
    }
  ];


  const timeRanges = [
    { id: '1h', name: 'Last Hour', description: 'Dernière heure' },
    { id: '24h', name: 'Last 24 Hours', description: 'Dernières 24 heures' },
    { id: '1w', name: 'Last Week', description: 'Dernière semaine' },
    { id: '1m', name: 'Last Month', description: 'Dernier mois' },
    { id: '2m', name: 'Last 2 Months', description: 'Derniers 2 mois' },
  ];

  const defaultColors = [
    { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.1)' },
    { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.1)' },
    { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.1)' },
    { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.1)' },
  ];

  const datasets = data.map((d, i) => ({
    label: d.label || `Dataset ${i + 1}`,
    data: d.data,
    borderColor: d.borderColor || defaultColors[i % defaultColors.length].border,
    backgroundColor: d.backgroundColor || defaultColors[i % defaultColors.length].bg,
    pointRadius: 0,
    tension: 0.1,
    borderWidth: 1.5,
    fill: false,
  }));

  const chartData = {
    labels: data[0]?.data?.map((_, i) => i), // si pas de labels, utilise les index
    datasets,
  };

  //console.log('datasets',datasets)
  //console.log('Chart Data:', chartData);


  // Fonction de débogage pour les périodes de temps
  const logTimeRangeInfo = (data, filteredData, timeRange) => {
    //console.log('Time Range:', timeRange);
    //console.log('Total data points:', data?.length);
    //console.log('Filtered data points:', filteredData?.length);
    if (data?.length > 0) {
      //console.log('First date:', new Date(data[0][0]));
      //console.log('Last date:', new Date(data[data.length - 1][0]));
    }
  };

  const filterDataByTimeRange = (inputData) => {
    //console.log(inputData)
    if (!inputData || inputData.length === 0) return [];
    const now = new Date().getTime();
    const ranges = {
      '1h': now - 3600000,
      '24h': now - 86400000,
      '1w': now - 604800000,
      '1m': now - 2592000000,
      '2m': now - 5184000000,
    };

    //console.log('Now:', now);
    //console.log('Ranges:', ranges);


    try {
      return inputData.filter(point => {
        // Add safety check for point structure
        if (Array.isArray(point) && point.length >= 1) {
          // //console.log(point[0]);
          return point[0] >= ranges[timeRange];
        }
        return false;
      });
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  };


  // Gère le changement de type de graphique
  const handleChartTypeChange = (type) => setChartType(type);

  // Calcule les statistiques à partir des données filtrées
  const calculateStats = () => {
    if (!data || data.length === 0) return { average: 'N/A', minimum: 'N/A', maximum: 'N/A', total: 'N/A' };

    let allPoints = [];

    // Check if data is array of datasets with label/data
    if (Array.isArray(data) && typeof data[0] === 'object' && data[0].hasOwnProperty('data')) {
      // Flatten all dataset arrays into one
      data.forEach(d => {
        if (Array.isArray(d.data)) {
          allPoints.push(...d.data);
        }
      });
    }
    // Else assume it's just an array of [timestamp, value]
    else if (Array.isArray(data) && Array.isArray(data[0])) {
      allPoints = data;
    }

    const filteredPoints = filterDataByTimeRange(allPoints);
    const allValues = filteredPoints.map(point => point[1]);

    //console.log(allValues)
    if (allValues.length === 0) return { average: 'N/A', minimum: 'N/A', maximum: 'N/A', total: 'N/A' };

    const sum = allValues.reduce((acc, val) => acc + val, 0);
    return {
      average: (sum / allValues.length).toFixed(2),
      minimum: Math.min(...allValues).toFixed(2),
      maximum: Math.max(...allValues).toFixed(2),
      total: sum.toFixed(2)
    };
  };

  const handleRefresh = () => {
    if (chartInstance.current) chartInstance.current.update('none');
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;


    let allPoints = [];

    // If it's One Block (array of datasets)
    if (Array.isArray(data) && typeof data[0] === 'object' && data[0].hasOwnProperty('data')) {
      data.forEach(dataset => {
        const points = filterDataByTimeRange(dataset.data || []);
        allPoints.push(...points);
      });
    }
    // If it's Two Block (array of [timestamp, value])
    else if (Array.isArray(data) && Array.isArray(data[0])) {
      allPoints = filterDataByTimeRange(data);
    }

    const allRows = allPoints.map(point => [
      new Date(point[0]).toISOString(),
      point[1]
    ]);

    
    const csvContent = [['Timestamp', 'Value'], ...allRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${feedName}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    //console.log('data:', data);

    const defaultColors = [
      { border: 'rgba(75,192,192,1)', bg: 'rgba(75,192,192,0.2)' },
      { border: 'rgba(255,99,132,1)', bg: 'rgba(255,99,132,0.2)' },
      { border: 'rgba(54,162,235,1)', bg: 'rgba(54,162,235,0.2)' },
      { border: 'rgba(255,206,86,1)', bg: 'rgba(255,206,86,0.2)' },
      { border: 'rgba(153,102,255,1)', bg: 'rgba(153,102,255,0.2)' },
    ];

    const datasets = Array.isArray(data)
      ? (data.length > 0 && typeof data[0] === 'object' && data[0].hasOwnProperty('label') && data[0].hasOwnProperty('data'))
        ? data.map((d, i) => {
          const validData = Array.isArray(d.data)
            ? d.data.filter(point =>
              Array.isArray(point) &&
              point.length === 2 &&
              typeof point[0] === 'number' &&
              typeof point[1] === 'number'
            )
            : [];

          //console.log('OneBlock-Feeds');
          const filteredData = filterDataByTimeRange(validData);

          const formattedData = filteredData.map(point => ({
            x: point[0],
            y: point[1]
          }));

          let baseConfig = {
            label: d.label || `Dataset ${i + 1}`,
            data: formattedData,
            borderColor: d.borderColor || defaultColors[i % defaultColors.length].border,
            backgroundColor: d.backgroundColor || defaultColors[i % defaultColors.length].bg,
            borderWidth: 0.9,
            spanGaps: true,
            tension: 0.3,
            fill: true,
            pointRadius: 1,
            pointHoverRadius: 6,
          };

          switch (chartType) {
            case 'scatter':
              baseConfig = {
                ...baseConfig,
                type: 'scatter',
                pointRadius: 4,
                pointHoverRadius: 8,
                showLine: false,
              };
              break;
            case 'bar':
              baseConfig = {
                ...baseConfig,
                borderRadius: { topLeft: 8, topRight: 8 },
                borderSkipped: false,
              };
              break;
            default:
              break;
          }

          return baseConfig;
        })
        : (data.every(item => Array.isArray(item) && item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number'))
          ? [{
            label: `${feedName}`,
            data: filterDataByTimeRange(data).map(point => ({
              x: point[0],
              y: point[1]
            })),
            borderColor: defaultColors[0].border,
            backgroundColor: defaultColors[0].bg,
            borderWidth: 0.9,
            spanGaps: true,
            tension: 0.3,
            fill: true,
            pointRadius: 1,
            pointHoverRadius: 6,
          }]
          : []
      : (() => {
        // 🧠 Fallback for single dataset object (not array)
        const validData = Array.isArray(data?.data)
          ? data.data.filter(point =>
            Array.isArray(point) &&
            point.length === 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number'
          )
          : [];

        const filteredData = filterDataByTimeRange(validData);

        const formattedData = filteredData.map(point => ({
          x: point[0],
          y: point[1]
        }));

        let baseConfig = {
          label: data.label || `${feedName}`,
          data: formattedData,
          borderColor: data.borderColor || defaultColors[0].border,
          backgroundColor: data.backgroundColor || defaultColors[0].bg,
          borderWidth: 2,
          spanGaps: true,
          tension: 0.3,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 6,
        };

        switch (chartType) {
          case 'scatter':
            baseConfig = {
              ...baseConfig,
              type: 'scatter',
              pointRadius: 4,
              pointHoverRadius: 8,
              showLine: false,
            };
            break;
          case 'bar':
            baseConfig = {
              ...baseConfig,
              borderRadius: { topLeft: 8, topRight: 8 },
              borderSkipped: false,
            };
            break;
          default:
            break;
        }

        return [baseConfig];
      })();

    const timeUnit = {
      '1h': 'minute',
      '24h': 'hour',
      '1w': 'day',
      '1m': 'day',
      '2m': 'week',
    }[timeRange];

    chartInstance.current = new Chart(ctx, {
      type: chartType === 'bar' ? 'bar' : 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: timeUnit },
            ticks: { source: 'auto' },
            adapters: { date: { locale: enUS } }
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return value;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartType, timeRange]);





  const stats = calculateStats();

  // Rendu du composant
  return (
    <div className="feed-chart-container">
      {/* En-tête avec contrôles */}
      <div className="chart-header">
        <div className="chart-controls">
          <div className="time-range-selector">
            {timeRanges.map((range) => (
              <button key={range.id} className={`time-range-option ${timeRange === range.id ? 'active' : ''}`}
                onClick={() => setTimeRange(range.id)}
                title={range.description}
              >
                {range.name}
              </button>
            ))}
          </div>
          <div className="chart-actions">
            <button className="action-button refresh-button" onClick={handleRefresh} title="Refresh data">
              <svg className="action-button-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              <span>Refresh</span>
            </button>
            <button className="action-button export-button" onClick={handleExportCSV} title="Export as CSV">
              <svg className="action-button-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="chart-type-selector">
          {chartTypes.map((type) => (
            <button key={type.id} className={`chart-type-option ${chartType === type.id ? 'active' : ''}`}
              onClick={() => handleChartTypeChange(type.id)}
              title={type.description}
            >
              <img src={type.icon} alt={type.name} className="chart-type-icon" />
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Zone du graphique */}
      <div className="chart-wrapper">
        <canvas ref={chartRef} />
      </div>
      {/* Affichage des statistiques */}
      <div className="chart-stats">
        <div className="stat-block">
          <div className="stat-label">Average</div>
          <div className="stat-value">{stats.average}</div>
        </div>
        <div className="stat-block">
          <div className="stat-label">Minimum</div>
          <div className="stat-value">{stats.minimum}</div>
        </div>
        <div className="stat-block">
          <div className="stat-label">Maximum</div>
          <div className="stat-value">{stats.maximum}</div>
        </div>
        <div className="stat-block">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>
    </div>
  );
};

export default FeedChart;