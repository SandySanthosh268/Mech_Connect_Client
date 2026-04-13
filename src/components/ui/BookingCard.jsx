import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Wrench, Calendar, Truck, CreditCard, Star, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingTimeline from '../BookingTimeline';

export function BookingCard({ booking, onAction, index = 0, role }) {
  const getStatusStyle = (status) => {
    const map = {
      REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
      ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
      PICKUP_STARTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      SERVICE_IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PAYMENT_PENDING: 'bg-rose-50 text-rose-700 border-rose-200',
      PAYMENT_COMPLETED: 'bg-emerald-600 text-white border-transparent',
      REJECTED: 'bg-slate-100 text-slate-600 border-slate-200',
      CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
      <Card className="p-0 border-slate-200 overflow-hidden group shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x dark:divide-slate-800">
          <div className="p-6 flex-1 flex flex-col items-stretch gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <Wrench size={24} />
              </div>
              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Booking #{booking.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {booking.bookingDate}</span>
                  {booking.pickupRequired && <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black"><Truck size={14} /> Pickup</span>}
                  {booking.amount > 0 && <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold italic">₹{booking.amount}</span>}
                </div>
              </div>
            </div>
            
            <div className="px-2">
              <BookingTimeline currentStatus={booking.status} />
            </div>
          </div>
          
          <div className="p-6 md:w-64 shrink-0 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center">
            {role === 'ROLE_CUSTOMER' && (
              <div className="flex flex-col gap-3 w-full">
                {(booking.status === 'COMPLETED' || booking.status === 'PAYMENT_PENDING') && (
                  <Button onClick={() => onAction('PAY', booking)} className="w-full h-12 font-black uppercase tracking-widest text-sm shadow-xl" leftIcon={<CreditCard size={18} />}>
                    Pay Now
                  </Button>
                )}
                {['COMPLETED', 'PAYMENT_COMPLETED'].includes(booking.status) && !booking.has_rating && (
                  <Button onClick={() => onAction('RATE', booking)} variant="secondary" className="w-full h-12 font-black uppercase tracking-widest text-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 hover:from-amber-100 hover:to-orange-100 shadow-sm" leftIcon={<Star size={18} />}>
                    Rate & Review
                  </Button>
                )}
                {booking.has_rating && (
                  <div className="flex flex-col items-center gap-2 py-2 w-full">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Reviewed</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={14} className="text-amber-400" fill={n <= (booking.rating_data?.score || 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    {booking.rating_data?.comment && (
                      <p className="text-[11px] text-slate-500 italic text-center leading-tight mt-1 px-2 line-clamp-2">
                        "{booking.rating_data.comment}"
                      </p>
                    )}
                  </div>
                )}
                {!['COMPLETED','PAYMENT_PENDING','PAYMENT_COMPLETED','REJECTED','CANCELLED'].includes(booking.status) && (
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Tracking
                  </div>
                )}
              </div>
            )}

            {role === 'ROLE_MECHANIC' && (
              <div className="flex flex-col gap-3 w-full">
                {onAction && !['COMPLETED', 'PAYMENT_COMPLETED', 'REJECTED', 'CANCELLED'].includes(booking.status) && (
                  <Button 
                    size="sm" 
                    onClick={() => onAction('UPDATE', booking)}
                    className="h-11 text-[10px] font-black uppercase tracking-widest"
                  >
                    Manage Job
                  </Button>
                )}
                {booking.has_rating && (
                  <div className="flex flex-col items-center gap-2 py-2 w-full">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black">{booking.rating_data?.score}/5</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={12} className="text-amber-400" fill={n <= (booking.rating_data?.score || 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    {booking.rating_data?.comment && (
                      <p className="text-[11px] text-slate-500 italic text-center leading-tight mt-1 px-2 line-clamp-2">
                        "{booking.rating_data.comment}"
                      </p>
                    )}
                  </div>
                )}
                {['COMPLETED', 'PAYMENT_COMPLETED'].includes(booking.status) && !booking.has_rating && (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic py-2">
                    Awaiting customer review
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
