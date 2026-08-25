import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Terminal, Shield, TrendingUp, Zap } from "lucide-react";

const Landing = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          The <span className="text-gradient">24/7 Intelligent</span> Code Reviewer.
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Automated, always-on reviews for the next generation of engineers. 
          Get instant multi-language bug reports, architectural guidance, and track your growth over time.
        </p>
        
        <button 
          onClick={loginWithGoogle}
          className="glass-button-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 w-full max-w-6xl"
      >
        <FeatureCard 
          icon={<Terminal size={24} className="text-accent-cyan" />}
          title="Multi-Language"
          desc="Native support for Python, JS, Java, Go, and more."
        />
        <FeatureCard 
          icon={<Shield size={24} className="text-accent-indigo" />}
          title="Historical Learning"
          desc="Grounded in your organization's real-world patterns."
        />
        <FeatureCard 
          icon={<Zap size={24} className="text-accent-cyan" />}
          title="Instant Feedback"
          desc="Zero wait time. Always-on serverless evaluation."
        />
        <FeatureCard 
          icon={<TrendingUp size={24} className="text-accent-indigo" />}
          title="Growth Tracking"
          desc="Persistent session history to visualize your progress."
        />
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-panel p-6 text-left flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
      {icon}
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
