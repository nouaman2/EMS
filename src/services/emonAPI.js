import axios from 'axios';

const BASE_URL = 'http://electricwave.ma/energymonitoring';
const API_KEY = '3ddd9a580253f6c9aab6298f754cf0fd';
const WRITE_API_KEY = '02f316fd3b4a3a52a8e3ed7a5d7d9ac2';

//recuperer la liste des tableaux de bord
export const getDashboardList = async () => {
  try {
    const targetUrl = `${BASE_URL}/dashboard/list.json?apikey=${WRITE_API_KEY}`;

    const response = await axios.get(`${targetUrl}`);

    const dashboards = response.data.map(dashboard => ({
      id: dashboard.id,
      name: dashboard.name,
      alias: dashboard.alias,
      description: dashboard.description,
      main: dashboard.main,
      public: dashboard.public,
    }));

    return dashboards;
  } catch (error) {
    console.error('Error fetching dashboard list:', error);
    throw error;
  }
};

//recuperer les donnees d'un tableau de bord
export const getDashboardData = async (dashboardId) => {
  try {
    const targetUrl = `${BASE_URL}/dashboard/view.json?id=${dashboardId}&apikey=${WRITE_API_KEY}`;

    const response = await axios.get(`${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

//recuperer la liste des flux
export const getFeedsList = async () => {
  try {
    const targetUrl = `${BASE_URL}/feed/list.json?apikey=${API_KEY}`;

    const response = await axios.get(`${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feeds list:', error);
    throw error;
  }
};

// fonction pour récupérer les données du graphique
export const getFeedData = async (feedId) => {
  try {
    const now = Math.floor(Date.now() / 1000);

    // Modifié pour 2 mois au lieu de 3 mois
    const end = now * 1000;
    const start = (now - (60 * 24 * 60 * 60)) * 1000; // 2 months ago

    const targetUrl = `${BASE_URL}/feed/data.json?` +
      `id=${feedId}&` +
      `start=${start}&` +
      `end=${end}&` +
      `interval=3600&` + // 1 heure d'intervalle pour réduire la quantité de données
      `skipmissing=1&` +
      `limitinterval=1&` +
      `apikey=${API_KEY}`;

    const response = await axios.get(`${targetUrl}`);

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid data format received:', response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching feed data:', error);
    return [];
  }
};

// Function to fetch data for specific dashboard types
export const getDashboardTypeData = async (dashboardType) => {
  try {
    // Calculate time range
    const now = Math.floor(Date.now() / 1000);
    const end = now * 1000;
    const start = (now - (365 * 24 * 60 * 60)) * 1000; // 1 year of data

    // Dashboard configurations mapped to API names
    const dashboardConfigs = {
      '1_MULTIPUISSANCES': {
        title: 'Multi-Phase Power Consumption',
        feeds: [
          {
            id: 24,
            name: 'P_PH1',
            color: { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.1)' }
          },
          {
            id: 25,
            name: 'P_PH2',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          },
          {
            id: 26,
            name: 'P_PH3',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 27,
            name: 'P_TOTALE',
            color: { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.1)' }
          }
        ]
      },
      '2_MULTICOURANTS': {
        title: 'Multi-Phase Current',
        feeds: [
          {
            id: 149,
            name: 'i1',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
          {
            id: 150,
            name: 'i2',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 151,
            name: 'i3',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          }
        ]
      },
      '4_TEMPERATURE': {
        title: 'temperature',
        feeds: [
          {
            id: 149,
            name: 'i1',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
          {
            id: 150,
            name: 'i2',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 151,
            name: 'i3',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          }
        ]
      },
      'A10_EAU EW': {
        title: 'Eau',
        feeds: [
          {
            id: 54,
            name: 'EAU EW',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
        ]
      },

    };

    // Use the dashboardType directly to fetch the correct configuration
    const config = dashboardConfigs[dashboardType];
    if (!config) {
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }

    // Fetch data for all feeds in parallel
    const feedDataPromises = config.feeds.map(async (feed) => {
      const targetUrl = `${BASE_URL}/feed/data.json?` +
        `id=${feed.id}&` +
        `start=${start}&` +
        `end=${end}&` +
        `interval=3600&` + // 1-hour intervals
        `skipmissing=0&` +
        `limitinterval=1&` +
        `apikey=${WRITE_API_KEY}`;

      try {
        const response = await axios.get(`${targetUrl}`);

        if (!Array.isArray(response.data)) {
          console.error(`Invalid data format for feed ${feed.name}:`, response.data);
          return {
            label: feed.name,
            data: [],
            borderColor: feed.color.border,
            backgroundColor: feed.color.background,
            pointRadius: 0,
            borderWidth: 1.5,
            tension: 0.1
          };
        }

        return {
          label: feed.name,
          data: response.data,
          borderColor: feed.color.border,
          backgroundColor: feed.color.background,
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0.1,
          fill: false
        };
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return {
          label: feed.name,
          data: [],
          borderColor: feed.color.border,
          backgroundColor: feed.color.background,
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0.1
        };
      }
    });

    // Wait for all data to be fetched
    const datasets = await Promise.all(feedDataPromises);

    return {
      title: config.title,
      type: dashboardType,
      datasets: datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                hour: 'HH:mm',
                day: 'MMM d',
                week: 'MMM d',
                month: 'MMM yyyy'
              }
            },
            ticks: {
              maxTicksLimit: 10,
              source: 'auto'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 8
            }
          }
        },
        plugins: {
          decimation: {
            enabled: true,
            algorithm: 'min-max'
          }
        }
      }
    };

  } catch (error) {
    console.error('Error in getDashboardTypeData:', error);
    return {
      type: dashboardType,
      datasets: [],
      options: {}
    };
  }
};

export const checkAvailableFeeds = async () => {
  try {
    const feeds = await getFeedsList();
    // console.log('Available feeds:', feeds);
    // This will show you all available feeds and their IDs
    return feeds;
  } catch (error) {
    console.error('Error checking feeds:', error);
    return [];
  }
};