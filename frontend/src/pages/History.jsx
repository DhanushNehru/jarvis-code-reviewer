import React, { useEffect, useState } from "react";
import { getReviewHistory, deleteHistoryReview } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, Trash2, ChevronDown, ChevronUp, Search, List } from "lucide-react";
import EvaluationReport from "../components/EvaluationReport";

const History = () => {
  const { theme, apiKey } = useSettings();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedReview, setSelectedReview] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getReviewHistory(apiKey);
      if (Array.isArray(data)) {
        setHistory(data);
        if (data.length > 0) {
          setSelectedReview(data[0]);
        }
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteHistoryReview(id, apiKey);
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      if (selectedReview?.id === id) {
        setSelectedReview(newHistory.length > 0 ? newHistory[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "#10B981";
    if (rating >= 5) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-accent-cyan">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="animate-pulse">Retrieving Archives...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-[85vh] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <List className="text-accent-cyan" size={32} /> Code Review History
          </h1>
          <p className="text-text-secondary">Review past evaluations and continuous improvement data.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Pane: List */}
        <div className="w-1/3 glass-panel overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary p-6 text-center">
              <Search size={32} className="mb-4 opacity-50" />
              <p>No review history found. Submit your first code snippet in the Dashboard.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedReview(item)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedReview?.id === item.id 
                    ? 'bg-white/10 border-accent-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                    : 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 bg-bg-dark rounded text-text-secondary border border-white/5 uppercase">
                      {item.language}
                    </span>
                    {item.full_review?.rating && (
                      <span 
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded shadow-sm"
                        style={{ backgroundColor: `${getRatingColor(item.full_review.rating)}20`, color: getRatingColor(item.full_review.rating) }}
                      >
                        {item.full_review.rating}/10
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-text-secondary hover:text-status-low transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium line-clamp-2 pr-2 text-white/90">
                    {item.summary}
                  </p>
                  <button 
                    onClick={(e) => toggleExpand(item.id, e)}
                    className="mt-1 text-text-secondary hover:text-white shrink-0 bg-white/5 rounded p-0.5"
                  >
                    {expandedItems[item.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                </div>

                {expandedItems[item.id] && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-xs text-text-secondary space-y-2">
                    <p>Date: {new Date(item.timestamp).toLocaleString()}</p>
                    {item.full_review?.bugs?.length > 0 && (
                      <p className="text-status-low">
                        Found {item.full_review.bugs.length} issues
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Pane: Detail View */}
        <div className="w-2/3 glass-panel overflow-y-auto custom-scrollbar p-6">
          {selectedReview ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedReview.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-white/10 mb-6">
                  <span className="font-mono text-xs px-3 py-1 bg-white/10 rounded-full text-text-secondary shadow-sm">
                    Reviewed on {new Date(selectedReview.timestamp).toLocaleString()}
                  </span>
                  <span className="font-mono text-xs px-3 py-1 bg-white/5 rounded-full border border-white/10 text-white/80 uppercase">
                    Lang: {selectedReview.language}
                  </span>
                </div>

                <EvaluationReport 
                  reviewResult={selectedReview.full_review}
                  originalCode={selectedReview.full_review?.original_code}
                  language={selectedReview.language}
                  isHistoryView={true}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
              <FileText size={64} className="mb-4" />
              <p>Select a review from the left pane to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
