import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Phone, Star, User, Wrench } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export function MechanicCard({ mechanic, onBook, index = 0 }) {
  const avgRating = mechanic.average_rating || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-transparent bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 text-2xl font-black border border-slate-100 italic">
            {mechanic.workshopName?.charAt(0)}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <CheckCircle2 size={12} /> Verified
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                <Star size={12} className="text-amber-500" fill="currentColor" />
                <span className="text-sm font-black text-amber-700">{avgRating}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
            {mechanic.workshopName || 'Professional Workshop'}
          </h3>

          {/* Star Rating Row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(n => (
                <Star 
                  key={n} 
                  size={14} 
                  className={n <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'}
                  fill={n <= Math.round(avgRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {avgRating > 0 ? `${avgRating} rating` : 'No reviews yet'}
            </span>
          </div>

          <div className="space-y-2">
            {mechanic.name && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold mb-1">
                <User size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                <span>{mechanic.name}</span>
              </div>
            )}
            {mechanic.specialty && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold mb-1">
                <Wrench size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                <span>{mechanic.specialty}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm italic">
              <MapPin size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{mechanic.address || 'Location Hidden'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold">
              <Phone size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
              <span>{mechanic.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <Button 
          className="mt-8 w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest" 
          onClick={() => onBook(mechanic)}
        >
          View Services & Book
        </Button>
      </Card>
    </motion.div>
  );
}
