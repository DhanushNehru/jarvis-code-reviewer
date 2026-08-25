import React from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Zap, AlertTriangle, Lightbulb, Shield, CheckCircle, Database, ChevronRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const EvaluationReport = ({ reviewResult, originalCode, language, onApplyFix, isHistoryView = false }) => {
  const { theme } = useSettings();

  const getRatingColor = (rating) => {
    if (rating >= 8) return "#10B981";
    if (rating >= 5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header / Rating */}
      <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-white/10 pb-6 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-3 flex items-center flex-wrap gap-3 text-white">
            J.A.R.V.I.S. Evaluation Report
            {reviewResult.time_complexity && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                Time: {reviewResult.time_complexity}
              </span>
            )}
            {reviewResult.space_complexity && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                Space: {reviewResult.space_complexity}
              </span>
            )}
            {isHistoryView && (
              <>
                {reviewResult.security_score && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-text-secondary">
                    Sec: {reviewResult.security_score}/10
                  </span>
                )}
                {reviewResult.performance_score && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-text-secondary">
                    Perf: {reviewResult.performance_score}/10
                  </span>
                )}
              </>
            )}
          </h2>
          <p className="text-white/80 text-lg italic border-l-2 border-accent-cyan/50 pl-4 py-1 bg-gradient-to-r from-accent-cyan/5 to-transparent">
            "{reviewResult.summary}"
          </p>
          
          {reviewResult.fixed_code && onApplyFix && (
            <button
              onClick={() => onApplyFix(reviewResult.fixed_code)}
              className="mt-6 flex items-center gap-2 bg-gradient-to-r from-accent-cyan/20 to-accent-indigo/20 hover:from-accent-cyan/30 hover:to-accent-indigo/30 border border-accent-cyan/30 text-accent-cyan px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]"
            >
              <Zap size={18} className="text-accent-cyan" />
              Apply J.A.R.V.I.S. Optimizations to Editor
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center bg-gradient-to-b from-white/10 to-white/5 px-8 py-5 rounded-2xl border border-white/10 shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: getRatingColor(reviewResult.rating) }} />
          <span className="text-5xl font-black tabular-nums tracking-tighter drop-shadow-md" style={{ color: getRatingColor(reviewResult.rating) }}>
            {reviewResult.rating}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">/ 10 Score</span>
        </div>
      </div>

      {/* RAG Transparency Panel */}
      {reviewResult.enforced_rules && (
        <div className="bg-gradient-to-r from-accent-indigo/10 to-transparent border border-accent-indigo/20 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          <h3 className="flex items-center gap-2 text-accent-indigo font-bold mb-3">
            <Database size={18} /> Organizational Guidelines Enforced
          </h3>
          <div className="text-xs text-white/70 whitespace-pre-wrap font-mono p-4 bg-black/30 rounded-lg border border-white/5 leading-relaxed">
            {reviewResult.enforced_rules}
          </div>
        </div>
      )}

      {/* Bugs */}
      {reviewResult.bugs?.length > 0 && (
        <div className="bg-gradient-to-b from-status-low/5 to-transparent rounded-xl p-5 border border-status-low/10">
          <h3 className="flex items-center gap-2 text-status-low font-bold mb-4 text-lg">
            <AlertTriangle size={20} /> Anomalies Detected
          </h3>
          <div className="space-y-4">
            {reviewResult.bugs.map((bug, i) => (
              <div key={i} className={`bg-white/5 border p-5 rounded-xl transition-all hover:bg-white/10 ${bug.category === 'Blocker' ? 'border-status-low/40 shadow-[0_4px_15px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold px-3 py-1 rounded text-white shadow-sm ${
                      bug.category === 'Blocker' ? 'bg-status-low' : 
                      bug.category === 'Suggestion' ? 'bg-status-med' : 'bg-accent-indigo'
                    }`}>
                      {bug.category || "Issue"}
                    </span>
                    <span className="font-mono text-xs px-3 py-1 bg-black/40 rounded border border-white/5 text-text-secondary">
                      Line {bug.line || "?"}
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-3 font-medium text-white/90 leading-relaxed">{bug.issue}</p>
                <div className="p-3 bg-status-high/10 rounded-lg border border-status-high/20">
                  <p className="text-sm text-status-high flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" /> 
                    <span className="leading-relaxed"><strong className="font-semibold">Fix:</strong> {bug.fix}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout for Insights and Optimizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Practices */}
        {reviewResult.bestPractices?.length > 0 && (
          <div className="bg-gradient-to-b from-accent-indigo/5 to-transparent rounded-xl p-5 border border-accent-indigo/10 h-full">
            <h3 className="flex items-center gap-2 text-accent-indigo font-bold mb-4 text-lg">
              <Shield size={20} /> Architectural Insights
            </h3>
            <ul className="space-y-3">
              {reviewResult.bestPractices.map((bp, i) => (
                <li key={i} className="text-sm text-white/80 flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/5 hover:border-accent-indigo/20 transition-colors">
                  <ChevronRight size={16} className="text-accent-indigo mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optimizations */}
        {reviewResult.optimizations?.length > 0 && (
          <div className="bg-gradient-to-b from-accent-cyan/5 to-transparent rounded-xl p-5 border border-accent-cyan/10 h-full">
            <h3 className="flex items-center gap-2 text-accent-cyan font-bold mb-4 text-lg">
              <Zap size={20} /> Individual Optimizations
            </h3>
            <ul className="space-y-3">
              {reviewResult.optimizations.map((opt, i) => (
                <li key={i} className="text-sm text-white/80 flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/5 hover:border-accent-cyan/20 transition-colors">
                  <Lightbulb size={16} className="text-accent-cyan mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Original Code (History View Only) */}
      {isHistoryView && originalCode && (
        <div className="pt-4">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
             Original Code Snippet
          </p>
          <div className="h-48 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-inner">
            <Editor
              height="100%"
              language={language?.toLowerCase() || "javascript"}
              theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
              value={originalCode}
              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12, padding: { top: 12 } }}
            />
          </div>
        </div>
      )}

      {/* Fixed Code (History View Only) */}
      {isHistoryView && reviewResult.fixed_code && (
        <div className="pt-2">
          <h3 className="flex items-center gap-2 text-status-high font-bold mb-3 uppercase text-xs tracking-widest">
            <CheckCircle size={16} /> J.A.R.V.I.S. Fixed Code
          </h3>
          <div className="h-64 bg-[#1e1e1e] rounded-xl overflow-hidden border border-status-high/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <Editor
              height="100%"
              language={language?.toLowerCase() || "javascript"}
              theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
              value={reviewResult.fixed_code}
              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12, padding: { top: 12 } }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EvaluationReport;
