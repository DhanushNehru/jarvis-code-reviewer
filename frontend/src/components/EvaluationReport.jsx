import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Zap, AlertTriangle, Lightbulb, Shield, CheckCircle, Database, ChevronRight, Activity, Volume2, Play, Pause, RotateCcw } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const EvaluationReport = ({ reviewResult, originalCode, language, onApplyFix, isHistoryView = false }) => {
  const { theme, soundEnabled } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null); // Prevent garbage collection of the utterance

  const getRatingColor = (rating) => {
    if (rating >= 8) return "#10B981"; // emerald-500
    if (rating >= 5) return "#F59E0B"; // amber-500
    return "#EF4444"; // red-500
  };

  const chartData = {
    labels: ['Code Quality', 'Security', 'Performance', 'Testing', 'Architecture'],
    datasets: [
      {
        label: 'Snippet Analytics',
        data: [
          reviewResult.rating || 0,
          reviewResult.security_score || reviewResult.rating || 0,
          reviewResult.performance_score || reviewResult.rating || 0,
          reviewResult.testing_score || reviewResult.rating || 0,
          reviewResult.architecture_score || reviewResult.rating || 0
        ],
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
        pointLabels: { color: theme === 'light' ? '#333' : '#a0a0a0', font: { size: 10, family: "'JetBrains Mono', monospace" } },
        ticks: { display: false, min: 0, max: 10, stepSize: 2 }
      }
    },
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  };

  useEffect(() => {
    // We don't auto-play on load anymore because browsers block it without direct interaction.
    // The user must click the play or replay button to hear the audio.
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReplay = () => {
    if ('speechSynthesis' in window) {
      // Must be synchronous to satisfy browser anti-autoplay policies!
      window.speechSynthesis.cancel();
      
      const textToSpeak = reviewResult.summary || "Evaluation complete.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      window.jarvisUtterance = utterance; 
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('Google US English'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utterance.onerror = (e) => { 
        console.error("Speech Synthesis Error: ", e);
        setIsSpeaking(false); 
        setIsPaused(false); 
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayPause = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        if (isPaused) {
          window.speechSynthesis.resume();
        } else {
          window.speechSynthesis.pause();
        }
      } else {
        handleReplay();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header / Rating */}
      <div className="flex flex-col md:flex-row md:items-stretch justify-between border-b border-white/10 pb-6 gap-6">
        <div className="flex-1 flex flex-col justify-between">
          <div>
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
            </h2>
            
            <div className="relative group">
              <p className="text-white/80 text-lg italic border-l-2 border-accent-cyan/50 pl-4 py-2 bg-gradient-to-r from-accent-cyan/5 to-transparent pr-24">
                "{reviewResult.summary}"
              </p>
              {soundEnabled && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={handlePlayPause}
                    className="p-2 rounded-full bg-white/5 hover:bg-accent-cyan/20 text-accent-cyan transition-colors border border-transparent hover:border-accent-cyan/30"
                    title={isSpeaking && !isPaused ? "Pause" : "Play"}
                  >
                    {isSpeaking && !isPaused ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button 
                    onClick={handleReplay}
                    className="p-2 rounded-full bg-white/5 hover:bg-accent-cyan/20 text-accent-cyan transition-colors border border-transparent hover:border-accent-cyan/30"
                    title="Replay Audio"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {reviewResult.fixed_code && onApplyFix && (
            <button
              onClick={() => onApplyFix(reviewResult.fixed_code)}
              className="mt-6 flex items-center gap-2 bg-gradient-to-r from-accent-cyan/20 to-accent-indigo/20 hover:from-accent-cyan/30 hover:to-accent-indigo/30 border border-accent-cyan/30 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] w-max"
            >
              <Zap size={18} className="text-accent-cyan" />
              Apply J.A.R.V.I.S. Optimizations to Editor
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          {/* Individual Analytics Radar */}
          <div className="bg-gradient-to-b from-white/10 to-white/5 p-4 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden flex flex-col items-center justify-center w-48 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-1">
              <Activity size={12} /> Analytics
            </h4>
            <div className="w-full h-32 relative">
              <Radar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center bg-gradient-to-b from-white/10 to-white/5 px-8 py-5 rounded-2xl border border-white/10 shrink-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: getRatingColor(reviewResult.rating) }} />
            <span className="text-5xl font-black tabular-nums tracking-tighter drop-shadow-md" style={{ color: getRatingColor(reviewResult.rating) }}>
              {reviewResult.rating}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">/ 10 Score</span>
          </div>
        </div>
      </div>

      {/* RAG Transparency Panel */}
      {reviewResult.enforced_rules && (
        <div className="bg-gradient-to-r from-accent-indigo/10 to-transparent border border-accent-indigo/20 p-5 rounded-xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          <h3 className="flex items-center gap-2 text-accent-indigo font-bold mb-3">
            <Database size={18} /> Organizational Guidelines Enforced
          </h3>
          <div className="text-xs text-white/90 whitespace-pre-wrap font-mono p-4 bg-black/40 rounded-lg border border-white/10 leading-relaxed shadow-inner">
            {reviewResult.enforced_rules}
          </div>
        </div>
      )}

      {/* Bugs */}
      {reviewResult.bugs?.length > 0 && (
        <div className="bg-gradient-to-b from-status-low/5 to-transparent rounded-xl p-5 border border-status-low/20">
          <h3 className="flex items-center gap-2 text-status-low font-bold mb-4 text-lg">
            <AlertTriangle size={20} /> Anomalies Detected
          </h3>
          <div className="space-y-4">
            {reviewResult.bugs.map((bug, i) => (
              <div key={i} className={`bg-black/20 border p-5 rounded-xl transition-all hover:bg-black/30 ${bug.category === 'Blocker' ? 'border-status-low/50 shadow-[0_4px_15px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold px-3 py-1 rounded shadow-sm ${
                      bug.category === 'Blocker' ? 'bg-status-low text-white' : 
                      bug.category === 'Suggestion' ? 'bg-status-med text-white' : 'bg-accent-indigo text-white'
                    }`}>
                      {bug.category || "Issue"}
                    </span>
                    {bug.line && bug.line !== "null" && bug.line !== "undefined" && bug.line !== "0" ? (
                      <span className="font-mono text-xs px-3 py-1 bg-white/10 rounded border border-white/10 text-white/80">
                        Line {bug.line}
                      </span>
                    ) : (
                      <span className="font-mono text-xs px-3 py-1 bg-white/10 rounded border border-white/10 text-white/80">
                        General
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm mb-4 font-medium text-white leading-relaxed">{bug.issue}</p>
                <div className="p-4 bg-status-high/10 rounded-lg border border-status-high/30">
                  <p className="text-sm text-status-high flex items-start gap-2">
                    <CheckCircle size={18} className="mt-0.5 shrink-0" /> 
                    <span className="leading-relaxed"><strong className="font-bold text-status-high">Fix:</strong> {bug.fix}</span>
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
          <div className="bg-gradient-to-b from-accent-indigo/5 to-transparent rounded-xl p-5 border border-accent-indigo/20 h-full">
            <h3 className="flex items-center gap-2 text-accent-indigo font-bold mb-4 text-lg">
              <Shield size={20} /> Architectural Insights
            </h3>
            <ul className="space-y-3">
              {reviewResult.bestPractices.map((bp, i) => (
                <li key={i} className="text-sm text-white flex items-start gap-3 bg-black/20 p-4 rounded-lg border border-white/10 hover:border-accent-indigo/30 transition-colors shadow-sm">
                  <ChevronRight size={18} className="text-accent-indigo mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optimizations */}
        {reviewResult.optimizations?.length > 0 && (
          <div className="bg-gradient-to-b from-accent-cyan/5 to-transparent rounded-xl p-5 border border-accent-cyan/20 h-full">
            <h3 className="flex items-center gap-2 text-accent-cyan font-bold mb-4 text-lg">
              <Zap size={20} /> Individual Optimizations
            </h3>
            <ul className="space-y-3">
              {reviewResult.optimizations.map((opt, i) => (
                <li key={i} className="text-sm text-white flex items-start gap-3 bg-black/20 p-4 rounded-lg border border-white/10 hover:border-accent-cyan/30 transition-colors shadow-sm">
                  <Lightbulb size={18} className="text-accent-cyan mt-0.5 shrink-0" /> 
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
          <div className="h-64 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-inner">
            <Editor
              height="100%"
              language={language?.toLowerCase() || "javascript"}
              theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
              value={originalCode}
              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, padding: { top: 12 } }}
            />
          </div>
        </div>
      )}

      {/* Fixed Code (History View Only) */}
      {isHistoryView && reviewResult.fixed_code && (
        <div className="pt-4">
          <h3 className="flex items-center gap-2 text-status-high font-bold mb-3 uppercase text-xs tracking-widest">
            <CheckCircle size={16} /> J.A.R.V.I.S. Fixed Code
          </h3>
          <div className="h-64 bg-[#1e1e1e] rounded-xl overflow-hidden border border-status-high/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Editor
              height="100%"
              language={language?.toLowerCase() || "javascript"}
              theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
              value={reviewResult.fixed_code}
              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, padding: { top: 12 } }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EvaluationReport;
