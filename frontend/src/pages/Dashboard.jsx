import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { submitCodeReview } from "../services/api";
import { motion } from "framer-motion";
import { Play, Loader2, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

const LANGUAGES = ["python", "javascript", "java", "go", "cpp", "typescript"];

const Dashboard = () => {
  const [code, setCode] = useState("# Write or paste your code here\n");
  const [language, setLanguage] = useState("python");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const result = await submitCodeReview(code, language);
      setReviewResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to evaluate code. Ensure the backend is running.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "var(--status-high)";
    if (rating >= 5) return "var(--status-med)";
    return "var(--status-low)";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Editor Section */}
      <div className="glass-panel p-4 flex flex-col gap-4 h-full">
        <div className="flex justify-between items-center">
          <select 
            className="glass-input !w-48 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-bg-dark">{lang.toUpperCase()}</option>
            ))}
          </select>
          <button 
            onClick={handleSubmit} 
            disabled={isEvaluating}
            className="glass-button flex items-center gap-2 disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Evaluate Code
          </button>
        </div>
        
        <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 }
            }}
          />
        </div>
      </div>

      {/* Review Section */}
      <div className="glass-panel p-6 overflow-y-auto custom-scrollbar h-full">
        {!reviewResult && !error && !isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary">
            <Lightbulb size={48} className="mb-4 opacity-20" />
            <p>Submit code to receive your instant AI evaluation.</p>
          </div>
        )}

        {isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-accent-cyan">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="animate-pulse">Analyzing logic & historical patterns...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-status-low-bg border border-status-low text-status-low flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {reviewResult && !isEvaluating && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Header / Rating */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Evaluation Report</h2>
                <p className="text-text-secondary text-sm">{reviewResult.summary}</p>
              </div>
              <div className="flex flex-col items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                <span className="text-4xl font-black tabular-nums" style={{ color: getRatingColor(reviewResult.rating) }}>
                  {reviewResult.rating}
                </span>
                <span className="text-xs uppercase tracking-widest text-text-secondary mt-1">/ 10</span>
              </div>
            </div>

            {/* Bugs */}
            {reviewResult.bugs?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-status-low font-semibold mb-4">
                  <AlertTriangle size={18} /> Critical Findings
                </h3>
                <div className="space-y-3">
                  {reviewResult.bugs.map((bug, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-text-secondary">
                          Line {bug.line || "?"}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{bug.issue}</p>
                      <p className="text-sm text-status-high flex items-center gap-2">
                        <CheckCircle size={14} /> Fix: {bug.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Practices */}
            {reviewResult.bestPractices?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-accent-indigo font-semibold mb-4">
                  <Shield size={18} /> Architecture & Best Practices
                </h3>
                <ul className="space-y-2">
                  {reviewResult.bestPractices.map((bp, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-indigo mt-1">•</span> {bp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optimizations */}
            {reviewResult.optimizations?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-accent-cyan font-semibold mb-4">
                  <Zap size={18} /> Optimization Insights
                </h3>
                <ul className="space-y-2">
                  {reviewResult.optimizations.map((opt, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-accent-cyan mt-1">•</span> {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
