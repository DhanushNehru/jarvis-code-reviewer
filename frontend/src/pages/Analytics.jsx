import React, { useEffect, useState } from "react";
import { getHistoryStats, getRecommendations } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Activity, BarChart3, Target, Shield, Zap, Search } from "lucide-react";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Analytics = () => {
  const { theme, apiKey } = useSettings();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getHistoryStats();
      setStats(data);
      
      setLoadingRecs(true);
      try {
        const recs = await getRecommendations(apiKey);
        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to fetch recs:", err);
      } finally {
        setLoadingRecs(false);
      }
      
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Code Quality', 'Security', 'Performance', 'Testing', 'Architecture'],
    datasets: [
      {
        label: 'Your Current Skill Matrix',
        data: stats ? [
          stats.average_rating || 0,
          stats.average_security || stats.average_rating || 0,
          stats.average_performance || stats.average_rating || 0,
          stats.average_testing || stats.average_rating || 0,
          stats.average_architecture || stats.average_rating || 0
        ] : [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        borderColor: 'rgba(0, 240, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 240, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 240, 255, 1)'
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' },
        grid: { color: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' },
        pointLabels: { color: theme === 'light' ? '#333' : '#a0a0a0', font: { size: 12, family: "'JetBrains Mono', monospace" } },
        ticks: { backdropColor: 'transparent', color: theme === 'light' ? '#666' : '#666', min: 0, max: 10, stepSize: 2 }
      }
    },
    plugins: {
      legend: {
        labels: { color: theme === 'light' ? '#333' : '#fff', font: { family: "'JetBrains Mono', monospace" } }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-accent-cyan">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="animate-pulse">Aggregating Global Engineering Metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="text-accent-cyan" size={32} /> 
          Performance Analytics & Growth
        </h1>
        <p className="text-text-secondary">Track your overall engineering metrics and AI-driven skill progression.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 flex flex-col relative overflow-hidden"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent pointer-events-none" />
          
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 relative z-10 text-white">
            <Target className="text-status-med" size={24} /> Overall Skill Matrix
          </h2>
          <div className="flex-1 min-h-[350px] flex items-center justify-center relative z-10">
            {stats && stats.total_reviews > 0 ? (
              <div className="w-full max-w-[400px] aspect-square">
                <Radar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary opacity-50 bg-bg-dark/50 rounded-lg">
                <Activity size={48} className="mb-4" />
                <p>Not enough data. Submit more reviews.</p>
              </div>
            )}
          </div>
          
          {stats && stats.total_reviews > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 shadow-sm">
                <div className="text-xs text-text-secondary uppercase mb-1 flex items-center gap-1"><Search size={12}/> Total</div>
                <div className="text-xl font-bold text-white">{stats.total_reviews} Reviews</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-status-med/20 shadow-sm">
                <div className="text-xs text-status-med uppercase mb-1 flex items-center gap-1"><Target size={12}/> Average</div>
                <div className="text-xl font-bold text-status-med">{stats.average_rating?.toFixed(1)}/10</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-accent-indigo/20 shadow-sm">
                <div className="text-xs text-accent-indigo uppercase mb-1 flex items-center gap-1"><Shield size={12}/> Security</div>
                <div className="text-xl font-bold text-accent-indigo">{stats.average_security?.toFixed(1)}/10</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-accent-cyan/20 shadow-sm">
                <div className="text-xs text-accent-cyan uppercase mb-1 flex items-center gap-1"><Zap size={12}/> Perf</div>
                <div className="text-xl font-bold text-accent-cyan">{stats.average_performance?.toFixed(1)}/10</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Growth Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 flex flex-col relative overflow-hidden"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-bl from-accent-indigo/5 to-transparent pointer-events-none" />
          
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2 relative z-10 text-white">
            <TrendingUp className="text-accent-indigo" size={24} /> Aggregate AI Growth Trajectory
          </h2>
          <p className="text-sm text-text-secondary mb-6 pb-4 border-b border-white/10 relative z-10">
            J.A.R.V.I.S. analyzed your recent code submissions to generate personalized learning paths for you.
          </p>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {loadingRecs ? (
              <div className="h-full flex flex-col items-center justify-center text-accent-indigo">
                <Loader2 size={32} className="animate-spin mb-4" /> 
                <p className="text-sm animate-pulse">Running advanced RAG analysis on your history...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <ul className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    key={idx} 
                    className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-accent-indigo/10 hover:border-accent-indigo/30 transition-colors shadow-sm"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo font-bold text-sm border border-accent-indigo/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                      {idx + 1}
                    </div>
                    <span className="text-sm text-white/90 leading-relaxed pt-1.5">{rec}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                <Activity size={48} className="mb-4" />
                <p>Submit more code for a personalized trajectory.</p>
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Analytics;
