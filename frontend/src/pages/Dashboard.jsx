import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { submitCodeReview } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, AlertTriangle, Lightbulb, Download } from "lucide-react";
import EvaluationReport from "../components/EvaluationReport";

const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp", "go", "rust"];
const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];

const Dashboard = () => {
  const { theme, apiKey } = useSettings();
  const [code, setCode] = useState("// Paste your code here or import from GitHub");
  const [language, setLanguage] = useState("javascript");
  const [model, setModel] = useState("gemini-2.5-flash");
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [githubUrl, setGithubUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  useEffect(() => {
    // Initial welcome message or setup could go here
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleImportGithub = async () => {
    if (!githubUrl.trim()) return;
    setIsFetchingUrl(true);
    try {
      let rawUrl = githubUrl;
      // Convert standard GitHub URL to raw.githubusercontent
      if (githubUrl.includes('github.com')) {
        rawUrl = githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }
      
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      
      const text = await response.text();
      setCode(text);
      setGithubUrl("");
      
      // Auto-detect language
      const ext = rawUrl.split('.').pop().toLowerCase();
      const extMap = {
        'py': 'python', 'js': 'javascript', 'jsx': 'javascript',
        'ts': 'typescript', 'tsx': 'typescript', 'java': 'java',
        'cpp': 'cpp', 'cc': 'cpp', 'c': 'cpp', 'go': 'go', 'rs': 'rust'
      };
      if (extMap[ext]) setLanguage(extMap[ext]);
      
    } catch (err) {
      setError("Could not import from GitHub. Ensure the URL is public and valid.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleEvaluate = async () => {
    if (!code || code.trim() === "") return;
    
    setIsEvaluating(true);
    setError(null);
    setReviewResult(null);

    try {
      const result = await submitCodeReview({
        code,
        language,
        model
      }, apiKey);
      
      setReviewResult(result);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during evaluation. Please check your API key.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full max-w-[100vw] h-[85vh] flex gap-4">
      {/* Left Pane - Editor */}
      <div className="w-1/2 flex flex-col gap-4">
        
        {/* Controls Bar */}
        <div className="glass-panel p-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="glass-input text-sm !py-1.5"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="glass-input text-sm !py-1.5"
            >
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button 
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex items-center gap-2 bg-accent-cyan hover:bg-accent-cyan/90 text-black px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {isEvaluating ? "Analyzing..." : "Evaluate"}
          </button>
        </div>

        {/* Enhanced GitHub Importer */}
        <div className="glass-panel p-3 flex items-center gap-3 bg-gradient-to-r from-white/5 to-transparent border border-white/10">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Paste public GitHub file URL to instantly import code..." 
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="glass-input text-sm !py-2 !px-10 w-full placeholder:text-text-secondary/50 focus:border-accent-indigo/50 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleImportGithub()}
            />
            {/* Using Download icon instead of Github icon to prevent the lucide-react export bug */}
            <Download className="absolute left-3 top-2.5 text-text-secondary opacity-50" size={16} />
          </div>
          <button 
            onClick={handleImportGithub}
            disabled={isFetchingUrl || !githubUrl}
            className="flex items-center gap-2 bg-white/10 hover:bg-accent-indigo/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
          >
            {isFetchingUrl ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Import
          </button>
        </div>

        {/* Editor Container */}
        <div className="flex-1 glass-panel overflow-hidden relative">
          <Editor
            height="100%"
            language={language}
            theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
            value={code}
            onChange={handleEditorChange}
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
      <div className="w-1/2 glass-panel p-6 overflow-y-auto custom-scrollbar">
        {!reviewResult && !error && !isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary">
            <Lightbulb size={64} className="mb-4 opacity-20 text-accent-cyan" />
            <p className="text-lg">Submit code to receive your instant AI evaluation.</p>
            <p className="text-sm opacity-50 mt-2 max-w-md text-center">J.A.R.V.I.S. will analyze your snippet for bugs, architectural best practices, and performance optimizations.</p>
          </div>
        )}

        {isEvaluating && (
          <div className="h-full flex flex-col items-center justify-center text-accent-cyan">
            <Loader2 size={64} className="animate-spin mb-6" />
            <p className="animate-pulse text-lg font-medium tracking-wide">Commander, I am analyzing your architecture...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-status-low/10 border border-status-low/30 text-status-low flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {reviewResult && !isEvaluating && (
          <EvaluationReport 
            reviewResult={reviewResult} 
            originalCode={null} // Don't show original code again in Dashboard, it's already in the editor
            language={language}
            onApplyFix={setCode}
            isHistoryView={false}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
