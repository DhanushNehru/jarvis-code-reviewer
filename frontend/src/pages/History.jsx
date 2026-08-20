import React, { useEffect, useState } from "react";
import { getReviewHistory, getHistoryStats } from "../services/api";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Code, FileText } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const History = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, statsData] = await Promise.all([
          getReviewHistory(),
          getHistoryStats()
        ]);
        setHistory(historyData.reviews || []);
        setStats(statsData || {});
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-accent-cyan">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  const chartData = {
    labels: stats?.trends?.map(t => new Date(t.date).toLocaleDateString()) || [],
    datasets: [
      {
        fill: true,
        label: 'Quality Rating',
        data: stats?.trends?.map(t => t.rating) || [],
        borderColor: '#66fcf1',
        backgroundColor: 'rgba(102, 252, 241, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Development Growth</h1>
        <p className="text-text-secondary">Track your code quality and optimization patterns over time.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <TrendingUp size={20} className="text-accent-cyan" />
            <span className="font-medium">Average Rating</span>
          </div>
          <span className="text-5xl font-black">{stats?.average_rating || "0.0"}</span>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <FileText size={20} className="text-accent-indigo" />
            <span className="font-medium">Total Reviews</span>
          </div>
          <span className="text-5xl font-black">{stats?.total_reviews || "0"}</span>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <Code size={20} className="text-status-high" />
            <span className="font-medium">Top Language</span>
          </div>
          <span className="text-3xl font-bold uppercase">
            {/* simple derivation from history */}
            {history.length > 0 ? history[0].language : "N/A"}
          </span>
        </div>
      </div>

      {/* Chart */}
      {stats?.trends?.length > 1 && (
        <div className="glass-panel p-6 h-80">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}

      {/* History List */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6">Review History</h3>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No reviews yet. Start coding!</p>
          ) : (
            history.map((review, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={review.id} 
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-text-secondary uppercase">
                      {review.language}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {new Date(review.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-1 text-white">{review.summary}</p>
                </div>
                
                <div className="flex flex-col items-center bg-bg-dark px-4 py-2 rounded-lg border border-white/5 shrink-0">
                  <span className="text-xl font-bold" style={{
                    color: review.rating >= 8 ? "var(--status-high)" : review.rating >= 5 ? "var(--status-med)" : "var(--status-low)"
                  }}>
                    {review.rating}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
