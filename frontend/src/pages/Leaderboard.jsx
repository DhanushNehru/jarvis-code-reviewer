import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Shield, Loader2 } from "lucide-react";
import api from "../services/api";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Import the api instance from our service
      const { data: privacyData } = await api.get("/leaderboard/privacy");
      setIsPublic(privacyData.is_public);
      
      const { data: lbData } = await api.get("/leaderboard");
      setLeaderboard(lbData);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async () => {
    setUpdatingPrivacy(true);
    try {
      const newStatus = !isPublic;
      await api.post("/leaderboard/privacy", { is_public: newStatus });
      setIsPublic(newStatus);
      // Refresh leaderboard after toggling
      const { data: lbData } = await api.get("/leaderboard");
      setLeaderboard(lbData);
    } catch (err) {
      alert("Failed to update privacy settings.");
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="text-status-med" size={32} /> Global Leaderboard
          </h1>
          <p className="text-text-secondary">Compare your Code Quality metrics with engineers worldwide.</p>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <Shield size={20} className={isPublic ? "text-accent-cyan" : "text-text-secondary"} />
          <div className="text-sm">
            <div className="font-bold text-white">Public Profile</div>
            <div className="text-text-secondary">Show your stats on the board</div>
          </div>
          <button 
            onClick={togglePrivacy}
            disabled={updatingPrivacy}
            className={`w-12 h-6 rounded-full transition-colors relative ml-4 ${isPublic ? 'bg-accent-cyan' : 'bg-gray-600'} ${updatingPrivacy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-bold text-sm tracking-wider uppercase text-text-secondary">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-7">Engineer ID</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">Reviews</div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center text-accent-cyan">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No engineers have opted-in to the global leaderboard yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={entry.uid} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 md:col-span-1 text-center font-bold">
                  {index === 0 ? <span className="text-status-med text-xl">#1</span> : 
                   index === 1 ? <span className="text-gray-400 text-lg">#2</span> : 
                   index === 2 ? <span className="text-amber-700 text-lg">#3</span> : 
                   <span className="text-text-secondary">#{index + 1}</span>}
                </div>
                <div className="col-span-6 md:col-span-7 font-mono text-sm truncate">
                  {entry.email.split('@')[0]}<span className="text-text-secondary">@...</span>
                </div>
                <div className="col-span-2 text-center font-bold text-accent-cyan text-lg">
                  {entry.average_rating.toFixed(1)}
                </div>
                <div className="col-span-2 text-center text-text-secondary">
                  {entry.total_reviews}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
