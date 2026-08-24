import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { submitCodeReview } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle, AlertTriangle, Lightbulb, Shield, Zap, Database, Volume2, VolumeX } from "lucide-react";

const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp", "go", "rust"];
const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];

const Dashboard = () => {
  const [code, setCode] = useState("// Write or paste your code here\n");
  const [language, setLanguage] = useState("python");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // High-tech sci-fi synthetic sounds using Web Audio API (No MP3s needed!)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch(e) { console.warn("Audio not supported"); }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsEvaluating(true);
    setError(null);
    playSound('start');
    try {
      const result = await submitCodeReview(code, language, model);
      setReviewResult(result);
      playSound('success');
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
      <div className="glass-panel p-4 flex flex-col gap-4 h-full relative overflow-hidden">
        <div className="flex justify-between items-center z-10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-text-secondary"
              title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <select 
              className="glass-input !w-32 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="bg-bg-dark">{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <select 
            className="glass-input !w-48 text-sm border-accent-cyan/50 text-accent-cyan font-semibold"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map(m => (
              <option key={m} value={m} className="bg-bg-dark">{m}</option>
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
        
        <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative z-10">
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
          
          {/* Holographic Scanner Animation */}
          <AnimatePresence>
            {isEvaluating && (
              <motion.div 
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-32 pointer-events-none z-20"
                style={{
                  background: "linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.2) 50%, rgba(0, 240, 255, 0.8) 95%, transparent)",
                  boxShadow: "0 10px 20px rgba(0, 240, 255, 0.3)"
                }}
              />
            )}
          </AnimatePresence>
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
            <p className="animate-pulse">Sir, I am analyzing your architecture...</p>
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
                <h2 className="text-2xl font-bold mb-2 flex items-center flex-wrap gap-3">
                  J.A.R.V.I.S. Evaluation Report
                  {reviewResult.time_complexity && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                      Time: {reviewResult.time_complexity}
                    </span>
                  )}
                  {reviewResult.space_complexity && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
                      Space: {reviewResult.space_complexity}
                    </span>
                  )}
                </h2>
                <p className="text-text-secondary text-sm italic">"{reviewResult.summary}"</p>
                {reviewResult.fixed_code && (
                  <button
                    onClick={() => setCode(reviewResult.fixed_code)}
                    className="mt-4 flex items-center gap-2 bg-gradient-to-r from-accent-cyan/20 to-accent-indigo/20 hover:from-accent-cyan/30 hover:to-accent-indigo/30 border border-accent-cyan/30 text-accent-cyan px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  >
                    <Zap size={16} className="text-accent-cyan" />
                    Apply J.A.R.V.I.S. Optimizations to Editor
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/10 shrink-0 ml-4">
                <span className="text-4xl font-black tabular-nums" style={{ color: getRatingColor(reviewResult.rating) }}>
                  {reviewResult.rating}
                </span>
                <span className="text-xs uppercase tracking-widest text-text-secondary mt-1">/ 10</span>
              </div>
            </div>

            {/* RAG Transparency Panel */}
            {reviewResult.enforced_rules && (
              <div className="bg-accent-indigo/10 border border-accent-indigo/30 p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-indigo" />
                <h3 className="flex items-center gap-2 text-accent-indigo font-bold mb-3">
                  <Database size={18} /> Organizational Guidelines Enforced
                </h3>
                <div className="text-xs text-text-secondary whitespace-pre-wrap font-mono p-3 bg-black/40 rounded border border-white/5">
                  {reviewResult.enforced_rules}
                </div>
              </div>
            )}

            {/* Bugs */}
            {reviewResult.bugs?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-status-low font-semibold mb-4">
                  <AlertTriangle size={18} /> Anomalies Detected
                </h3>
                <div className="space-y-3">
                  {reviewResult.bugs.map((bug, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 p-4 rounded-lg ${bug.category === 'Blocker' ? 'border-status-low/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
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
            {reviewResult.bestPractices?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-accent-indigo font-semibold mb-4">
                  <Shield size={18} /> Architectural Insights
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
                  <Zap size={18} /> Recommended Optimizations
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
