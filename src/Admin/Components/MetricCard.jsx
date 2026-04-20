import React from 'react';

const MetricCard = ({ title, value, trendText, trendType = 'neutral' }) => {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      {trendText && (
        <div className={`metric-trend trend-${trendType}`}>
          {trendText}
        </div>
      )}
    </div>
  );
};

export default MetricCard;