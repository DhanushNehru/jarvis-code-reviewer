import React, { useEffect, useState } from "react";
import { getReviewHistory, getHistoryStats, deleteHistoryReview, getRecommendations } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, TrendingUp, Code, FileText, Activity, Trash2, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Zap, CheckCircle, Search, ChevronLeft, ChevronRight, BarChart3, List, PlaySquare } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Filler,
  Legend
);

const History = () => {
  const { theme, apiKey } = useSettings();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("log"); // 'log', 'analytics', 'demo'
  
  // States for Two-Pane, Search, and Pagination
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this review history?")) {
      try {
        await deleteHistoryReview(id);
        setHistory(prev => prev.filter(r => r.id !== id));
        if (selectedId === id) setSelectedId(null);
      } catch (err) {
        alert("Failed to delete review.");
      }
    }
  };

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

  useEffect(() => {
    if (activeTab === 'analytics' && recommendations.length === 0 && !loadingRecs) {
      const fetchRecs = async () => {
        setLoadingRecs(true);
        try {
          const recs = await getRecommendations(apiKey);
          setRecommendations(recs || []);
        } catch(err) {
          console.error("Failed to fetch recs", err);
        } finally {
          setLoadingRecs(false);
        }
      };
      fetchRecs();
    }
  }, [activeTab, recommendations.length, loadingRecs, apiKey]);

  // Filter and Paginate Data
  const filteredHistory = history.filter(review => 
    review.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
    review.language.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedReview = history.find(r => r.id === selectedId);

  useEffect(() => {
    if (filteredHistory.length > 0 && !selectedId) {
      setSelectedId(filteredHistory[0].id);
    }
  }, [filteredHistory, selectedId]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-accent-cyan">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  // --- Charts Logic ---
  const chartData = {
    labels: stats?.trends?.map(t => new Date(t.date).toLocaleDateString()) || [],
    datasets: [{
      fill: true,
      label: 'Quality Rating',
      data: stats?.trends?.map(t => t.rating) || [],
      borderColor: '#66fcf1',
      backgroundColor: 'rgba(102, 252, 241, 0.1)',
      tension: 0.4,
    }]
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } };

  let totalSec = 0, totalPerf = 0, totalArch = 0, totalTest = 0, scoredReviews = 0;
  history.forEach(r => {
    if (r.full_review?.security_score !== undefined) {
      scoredReviews++;
      totalSec += r.full_review.security_score;
      totalPerf += r.full_review.performance_score;
      totalArch += r.full_review.architecture_score;
      totalTest += r.full_review.testing_score;
    }
  });

  const avgRating = stats?.average_rating || 0;
  
  // Use actual scores if available, fallback to old math for legacy
  const securityScore = scoredReviews > 0 ? (totalSec / scoredReviews) : Math.max(1, Math.min(10, avgRating + 1));
  const performanceScore = scoredReviews > 0 ? (totalPerf / scoredReviews) : Math.max(1, Math.min(10, avgRating + 0.5));
  const architectureScore = scoredReviews > 0 ? (totalArch / scoredReviews) : Math.max(1, Math.min(10, avgRating - 0.5));
  const testingScore = scoredReviews > 0 ? (totalTest / scoredReviews) : Math.max(1, Math.min(10, avgRating - 1));

  const radarData = {
    labels: ['Security', 'Performance', 'Architecture', 'Testing & Edge Cases'],
    datasets: [{
      label: 'Skill Matrix',
      data: [securityScore, performanceScore, architectureScore, testingScore],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#66fcf1',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#66fcf1',
      borderWidth: 2,
    }],
  };
  const radarOptions = { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 10, ticks: { display: false }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, angleLines: { color: 'rgba(255, 255, 255, 0.1)' }, pointLabels: { color: '#a0aec0', font: { size: 12 } } } }, plugins: { legend: { display: false } } };

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Development Hub</h1>
          <p className="text-text-secondary">Track your code quality, review logs, and training materials.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setActiveTab("log")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'log' ? 'bg-accent-cyan text-bg-dark' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
          >
            <List size={16} /> Review Log
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-accent-cyan text-bg-dark' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
          >
            <BarChart3 size={16} /> Skill Matrix
          </button>
          <button 
            onClick={() => setActiveTab("demo")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'demo' ? 'bg-accent-cyan text-bg-dark' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
          >
            <PlaySquare size={16} /> Demo & Resources
          </button>
        </div>
      </div>

      {activeTab === "analytics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
                {history.length > 0 ? history[0].language : "N/A"}
              </span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.trends?.length > 0 && (
              <div className="glass-panel p-6 h-80 flex flex-col">
                <h3 className="flex items-center gap-2 text-sm font-bold text-accent-cyan mb-4 uppercase tracking-wider">
                  <TrendingUp size={16} /> Rating Trend
                </h3>
                <div className="flex-1 relative">
                  <Line options={chartOptions} data={chartData} />
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="glass-panel p-6 h-80 flex flex-col">
                <h3 className="flex items-center gap-2 text-sm font-bold text-accent-indigo mb-4 uppercase tracking-wider">
                  <Activity size={16} /> Skill Matrix Analysis
                </h3>
                <div className="flex-1 relative">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="glass-panel p-6">
             <h3 className="flex items-center gap-2 text-sm font-bold text-status-med mb-4 uppercase tracking-wider">
               <Lightbulb size={16} /> AI Growth Recommendations
             </h3>
             {loadingRecs ? (
               <div className="flex items-center gap-2 text-text-secondary">
                 <Loader2 size={16} className="animate-spin" /> Analyzing your history...
               </div>
             ) : (
               <ul className="space-y-3">
                 {recommendations.map((rec, idx) => (
                   <li key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded border border-white/10">
                     <span className="text-status-med font-mono text-sm mt-0.5">0{idx + 1}</span>
                     <span className="text-sm text-white/90">{rec}</span>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </motion.div>
      )}

      {activeTab === "demo" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PlaySquare size={20} className="text-accent-cyan"/> Feature Demo & Tutorial Example
          </h3>
          <p className="text-text-secondary mb-6 max-w-2xl text-center">
            Watch this quick YouTube walkthrough to learn how to master J.A.R.V.I.S Code Reviewer and optimize your workflow.
          </p>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(102,252,241,0.1)]">
            <iframe 
              width="100%" 
              height="100%" 
              src="" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      )}

      {activeTab === "log" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
          {/* Left Pane: List View with Search & Pagination */}
          <div className="glass-panel p-4 flex flex-col gap-4 overflow-hidden h-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search history by keyword or language..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="glass-input pl-10 w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {paginatedHistory.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No results found.</p>
              ) : (
                paginatedHistory.map((review, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={review.id} 
                    onClick={() => setSelectedId(review.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedId === review.id 
                        ? 'bg-white/10 border-accent-cyan/50 shadow-[0_0_15px_rgba(102,252,241,0.1)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-text-secondary uppercase">
                        {review.language}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-white line-clamp-2 mb-3 leading-snug">
                      {review.summary}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{
                        color: review.rating >= 8 ? "var(--status-high)" : review.rating >= 5 ? "var(--status-med)" : "var(--status-low)"
                      }}>
                        Score: {review.rating}/10
                      </span>
                      <button 
                        onClick={(e) => handleDelete(review.id, e)}
                        className="p-1.5 text-text-secondary hover:text-status-low hover:bg-status-low/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-text-secondary font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right Pane: Detailed View */}
          <div className="lg:col-span-2 glass-panel p-6 overflow-y-auto custom-scrollbar h-full">
            {selectedReview ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedReview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-6"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/10">
                    <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-text-secondary uppercase">
                      {selectedReview.language}
                    </span>
                    <span className="text-sm text-text-secondary">
                      Reviewed on {new Date(selectedReview.timestamp).toLocaleString()}
                    </span>
                    {selectedReview.full_review?.time_complexity && (
                      <span className="font-mono text-xs px-2 py-1 bg-accent-cyan/10 text-accent-cyan rounded border border-accent-cyan/20" title="Time Complexity">
                        {selectedReview.full_review.time_complexity}
                      </span>
                    )}
                    {selectedReview.full_review?.space_complexity && (
                      <span className="font-mono text-xs px-2 py-1 bg-accent-indigo/10 text-accent-indigo rounded border border-accent-indigo/20" title="Space Complexity">
                        {selectedReview.full_review.space_complexity}
                      </span>
                    )}
                    {selectedReview.full_review?.security_score && (
                       <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded border border-white/20" title="Security Score">
                         Sec: {selectedReview.full_review.security_score}/10
                       </span>
                    )}
                    {selectedReview.full_review?.performance_score && (
                       <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded border border-white/20" title="Performance Score">
                         Perf: {selectedReview.full_review.performance_score}/10
                       </span>
                    )}
                  </div>

                  <p className="text-lg text-white font-medium">{selectedReview.summary}</p>

                  {/* Original Code */}
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase mb-2">Original Code Snippet</p>
                    {selectedReview.full_review?.original_code ? (
                      <div className="h-48 bg-bg-dark rounded-lg overflow-hidden border border-white/5 shadow-inner">
                        <Editor
                          height="100%"
                          language={selectedReview.language.toLowerCase()}
                          theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
                          value={selectedReview.full_review.original_code}
                          options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12 }}
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-bg-dark rounded-lg border border-white/5 text-center text-text-secondary text-sm italic">
                        Code snippet unavailable for this legacy review.
                      </div>
                    )}
                  </div>

                  {/* Bugs & Issues */}
                  {selectedReview.full_review?.bugs?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-status-low font-semibold mb-3">
                        <AlertTriangle size={18} /> Found Issues & Bugs
                      </h3>
                      <div className="space-y-3">
                        {selectedReview.full_review.bugs.map((bug, i) => (
                          <div key={i} className={`bg-bg-dark border border-white/5 p-4 rounded-lg ${bug.category === 'Blocker' ? 'border-status-low/30' : ''}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-mono text-xs px-2 py-1 rounded text-white ${
                                bug.category === 'Blocker' ? 'bg-status-low' : 
                                bug.category === 'Suggestion' ? 'bg-status-med' : 'bg-accent-indigo'
                              }`}>
                                {bug.category || "Issue"}
                              </span>
                              <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-text-secondary">
                                Line {bug.line || "?"}
                              </span>
                            </div>
                            <p className="text-sm mb-2 font-medium">{bug.issue}</p>
                            <p className="text-sm text-status-high flex items-center gap-2">
                              <CheckCircle size={14} /> Fix: {bug.fix}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Practices */}
                  {selectedReview.full_review?.bestPractices?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-accent-indigo font-semibold mb-3">
                        <Lightbulb size={18} /> Best Practices
                      </h3>
                      <ul className="space-y-2">
                        {selectedReview.full_review.bestPractices.map((practice, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 bg-bg-dark p-3 rounded-lg border border-white/5">
                            <span className="text-accent-indigo mt-0.5">•</span>
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optimizations */}
                  {selectedReview.full_review?.optimizations?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-accent-cyan font-semibold mb-3">
                        <Zap size={18} /> Optimizations
                      </h3>
                      <ul className="space-y-2">
                        {selectedReview.full_review.optimizations.map((opt, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 bg-bg-dark p-3 rounded-lg border border-white/5">
                            <span className="text-accent-cyan mt-0.5">•</span>
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fixed Code */}
                  {selectedReview.full_review?.fixed_code && (
                    <div>
                      <h3 className="flex items-center gap-2 text-status-high font-semibold mb-3">
                        <CheckCircle size={18} /> J.A.R.V.I.S. Fixed Code
                      </h3>
                      <div className="h-64 bg-bg-dark rounded-lg overflow-hidden border border-status-high/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                        <Editor
                          height="100%"
                          language={selectedReview.language.toLowerCase()}
                          theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
                          value={selectedReview.full_review.fixed_code}
                          options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12 }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                <FileText size={64} className="mb-4" />
                <p>Select a review from the left pane to view details</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default History;
