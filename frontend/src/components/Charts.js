import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d1421',
      borderColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1,
      titleColor: '#f0f4ff',
      bodyColor: '#94a3b8',
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 11 } },
      beginAtZero: true,
    },
  },
};

export function ClicksLineChart({ data = [] }) {
  const labels = data.map(d => format(new Date(d.date), 'MMM d'));
  const clicks = data.map(d => d.clicks);
  const unique = data.map(d => d.unique_clicks);

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Total Clicks',
            data: clicks,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Unique',
            data: unique,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            borderDash: [4, 4],
          },
        ],
      }}
      options={{
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            display: true,
            labels: { color: '#94a3b8', usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } },
          },
        },
      }}
    />
  );
}

export function DeviceDonutChart({ data = [] }) {
  const colors = { desktop: '#6366f1', mobile: '#10b981', tablet: '#f59e0b', unknown: '#64748b' };
  return (
    <Doughnut
      data={{
        labels: data.map(d => d.device_type || 'unknown'),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => colors[d.device_type] || '#64748b'),
          borderWidth: 0,
          hoverOffset: 6,
        }],
      }}
      options={{
        ...chartDefaults,
        cutout: '70%',
        scales: {},
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#94a3b8', usePointStyle: true, pointStyleWidth: 8, font: { size: 11 }, padding: 16 },
          },
        },
      }}
    />
  );
}

export function ReferrerBarChart({ data = [] }) {
  return (
    <Bar
      data={{
        labels: data.map(d => {
          try { return new URL(d.referrer === 'Direct' ? 'http://direct' : d.referrer).hostname.replace('www.', '') || 'Direct'; } catch { return d.referrer || 'Direct'; }
        }),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 6,
          hoverBackgroundColor: '#6366f1',
        }],
      }}
      options={{ ...chartDefaults }}
    />
  );
}

export function HourlyBarChart({ data = [] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const clickMap = Object.fromEntries(data.map(d => [d.hour, d.clicks]));
  return (
    <Bar
      data={{
        labels: hours.map(h => `${h}:00`),
        datasets: [{
          data: hours.map(h => clickMap[h] || 0),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 4,
          hoverBackgroundColor: '#10b981',
        }],
      }}
      options={{ ...chartDefaults }}
    />
  );
}
