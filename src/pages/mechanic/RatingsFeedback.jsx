import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMechanicRatings, getMechanicFeedback } from '../../services/mechanicService';
import { Card, RatingStars, Loader } from '../../components/ui';
import { Star, MessageSquare, Award, User, Quote, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RatingsFeedback() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const mechanicId = user?.mechanicId || user?.id;
        const [rRes, fRes] = await Promise.all([
          getMechanicRatings(mechanicId),
          getMechanicFeedback(mechanicId)
        ]);
        setRatings(rRes.data.data || []);
        setFeedback(fRes.data.data || []);
      } catch {
        console.error('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    if (user?.mechanicId || user?.id) loadData();
  }, [user]);

  if (loading) return <Loader />;

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, curr) => acc + (curr.score || 0), 0) / ratings.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ratings & Reviews</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 font-semibold italic">Track your professional reputation and customer sentiment.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 pr-8 rounded-[32px] shadow-xl border border-slate-100">
           <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-black text-2xl italic">
             {avgRating}
           </div>
           <div>
              <div className="flex gap-0.5 text-amber-400">
                 {[1,2,3,4,5].map(n => <Star key={n} size={14} fill={n <= Math.round(avgRating) ? 'currentColor' : 'none'} />)}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{ratings.length} Total Verified Reviews</p>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      {ratings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reviews', value: ratings.length, icon: <MessageSquare size={18} />, color: 'bg-blue-50 text-blue-600' },
            { label: 'Avg Rating', value: avgRating, icon: <Star size={18} />, color: 'bg-amber-50 text-amber-600' },
            { label: '5-Star Reviews', value: ratings.filter(r => r.score === 5).length, icon: <Award size={18} />, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Feedback Items', value: feedback.length, icon: <TrendingUp size={18} />, color: 'bg-purple-50 text-purple-600' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 border-slate-100 hover:shadow-lg transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Reviews with Ratings */}
        <div className="space-y-6">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <MessageSquare size={16} className="text-primary" /> Customer Reviews
           </h2>
           {(ratings.length === 0 && feedback.length === 0) ? (
              <Card className="p-20 text-center border-dashed border-2 bg-slate-50/50 flex flex-col items-center">
                 <Quote size={40} className="text-slate-200 mb-4 rotate-180" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No reviews yet.</p>
              </Card>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {ratings.map((r, i) => (
                  <motion.div key={r.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-6 md:p-8 bg-white border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                       <Quote className="absolute -top-4 -right-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -z-0" />
                       <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 uppercase font-black text-slate-500 text-xs shadow-inner">
                             {r.customer_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-1">
                               <p className="font-black text-slate-900 tracking-tight leading-none">{r.customer_name || 'Verified Customer'}</p>
                               <div className="flex gap-0.5 shrink-0 ml-2">
                                 {[1,2,3,4,5].map(n => (
                                   <Star key={n} size={12} className="text-amber-400" fill={n <= (r.score || 0) ? 'currentColor' : 'none'} />
                                 ))}
                               </div>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                               {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                             </p>
                             {r.comment && (
                               <p className="text-slate-700 font-medium italic leading-relaxed">"{r.comment}"</p>
                             )}
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Show feedback that doesn't have a matching rating */}
                {feedback.filter(f => !ratings.some(r => r.booking === f.booking)).map((f, i) => (
                  <motion.div key={`fb-${f.id || i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (ratings.length + i) * 0.05 }}>
                    <Card className="p-6 md:p-8 bg-white border-slate-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
                       <Quote className="absolute -top-4 -right-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -z-0" />
                       <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 uppercase font-black text-slate-500 text-xs shadow-inner">
                             {f.customer_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 tracking-tight leading-none mb-1">{f.customer_name || 'Verified Customer'}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                               {f.created_at ? new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                             </p>
                             <p className="text-slate-700 font-medium italic leading-relaxed">"{f.content}"</p>
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Score Breakdown */}
        <div className="space-y-6">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <Award size={16} className="text-primary" /> Score Breakdown
           </h2>
           <Card className="p-8 space-y-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Star size={120} />
              </div>
              <div className="space-y-6 relative z-10">
                 {[5,4,3,2,1].map(n => {
                   const count = ratings.filter(r => r.score === n).length;
                   const perc = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                   return (
                     <div key={n} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="flex items-center gap-2">
                             <Star size={12} className="text-amber-400" fill={n >= 4 ? 'currentColor' : 'none'} />
                             {n} Stars
                           </span>
                           <span className="text-slate-400">{count} {count === 1 ? 'Review' : 'Reviews'}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${perc}%` }} 
                            transition={{ delay: 0.3 + n * 0.1, duration: 0.6 }}
                            className={`h-full rounded-full ${n >= 4 ? 'bg-emerald-500' : n >= 3 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                           />
                        </div>
                     </div>
                   );
                 })}
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Quality Assurance Program Active</p>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      {parseFloat(avgRating) >= 4 ? 'Top Rated' : parseFloat(avgRating) >= 3 ? 'Rising Star' : 'Building Rep'}
                    </span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
