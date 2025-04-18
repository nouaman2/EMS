import { useState, useEffect } from 'react';
import { getFeedsList, getFeedData } from '../../services/emonAPI';
import FeedChart from '../Chart/FeedChart';

const FeedsList = () => {
  const [feeds, setFeeds] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const data = await getFeedsList();
        setFeeds(data);
      } catch {
        setError('Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  const groupedFeeds = feeds.reduce((acc, feed) => {
    const tag = feed.tag || 'Untagged';
    acc[tag] = acc[tag] || [];
    acc[tag].push(feed);
    return acc;
  }, {});

  const toggleNode = (node) =>
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));

  const getTimeDifference = (timestamp) => {
    if (!timestamp) return { text: 'Never', isRecent: false };
    
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 10) {
      return { text: 'Just now', isRecent: true };
    } else if (diff < 60) {
      return { text: `${diff} seconds ago`, isRecent: false };
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return { text: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`, isRecent: false };
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return { text: `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`, isRecent: false };
    } else {
      return { text: new Date(timestamp * 1000).toLocaleString(), isRecent: false };
    }
  };

  const handleFeedClick = async (feed) => {
    try {
      const data = await getFeedData(feed.id);
      if (data && Array.isArray(data) && data.length > 0) {
        setSelectedFeed({
          ...feed,
          chartData: data
        });
      } else {
        setSelectedFeed({
          ...feed,
          chartData: []
        });
      }
    } catch (error) {
      console.error('Failed to load feed data:', error);
      setSelectedFeed({
        ...feed,
        chartData: []
      });
    }
  };

  if (loading) {
    return <div className="feeds-loading">Loading...</div>;
  }

  if (error) {
    return <div className="feeds-error">{error}</div>;
  }

  if (!Object.keys(groupedFeeds).length) {
    return <div className="feeds-empty">No feeds available</div>;
  }
  return (
    <div className="feeds-container">
      <h3 className="feeds-title">Feeds By Node</h3>

      <div className="feeds-layout">
        <div className="feeds-sidebar">
          <div className="feeds-list">
            {Object.entries(groupedFeeds).map(([node, feeds]) => (
              <div key={node} className="feed-node">
                <button 
                  className="node-header" 
                  onClick={() => toggleNode(node)}
                >
                  <span className="node-title">{`${node} (${feeds.length})`}</span>
                  <span className={`expand-icon ${expandedNodes[node] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedNodes[node] && (
                  <div className="node-content">
                    {feeds.map((feed) => {
                      const updateTime = getTimeDifference(feed.time);
                      return (
                        <button
                          key={feed.id}
                          className={`feed-item ${selectedFeed?.id === feed.id ? 'selected' : ''}`}
                          onClick={() => handleFeedClick(feed)}
                        >
                          <div className="feed-item-header">
                            <span className="feed-name">{feed.name}</span>
                          </div>
                          <div className="feed-item-details">
                            <span className={`feed-value ${!feed.value ? 'no-value' : ''}`}>
                              Value: {feed.value || 'N/A'}
                              {feed.unit && ` ${feed.unit}`}
                            </span>

                            <span className={`feed-update ${updateTime.isRecent ? 'recent' : ''}`}>
                              Updated: {updateTime.text}
                            </span>

                            {feed.datatype && (
                              <span className="feed-type">
                                Type: {feed.datatype}
                              </span>
                            )}

                            {feed.processList && (
                              <span className="feed-process">
                                Process: {feed.processList}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="feeds-chart-area">
          {selectedFeed ? (
            <div className="chart-container">
              <h3 className="chart-title">{selectedFeed.name}</h3>
              {selectedFeed.chartData && selectedFeed.chartData.length > 0 ? (
                <FeedChart 
                  data={selectedFeed.chartData} 
                  feedName={selectedFeed.name}
                  defaultTimeRange="1w"
                />
              ) : (
                <div className="no-data-message">
                  <svg className="no-data-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
                  </svg>
                  <span>No data available for this feed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-chart-message">
              Select a feed to view its chart
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedsList;