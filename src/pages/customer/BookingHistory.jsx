import React, { useState, useEffect } from 'react';
import { getCustomerBookings, processPayment } from '../../services/bookingService';
import { submitRating, submitFeedback } from '../../services/mechanicService';
import { Button, Card, BookingCard, Notification, RatingStars, Loader } from '../../components/ui';
import { ClipboardList, Star, CreditCard, X, Shield, CheckCircle2, Smartphone, Banknote, ChevronRight, MessageSquare, Sparkles, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPay, setShowPay] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notif, setNotif] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadBookings = async () => {
    try {
      const res = await getCustomerBookings();
      setBookings(res.data.data || []);
    } catch {
      setNotif({ message: 'Error loading bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === 'ACTIVE') return !['COMPLETED', 'PAYMENT_COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status);
    if (activeFilter === 'COMPLETED') return ['COMPLETED', 'PAYMENT_COMPLETED'].includes(b.status);
    return true;
  });

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      await processPayment({ 
        booking: selectedBooking.id, 
        amount: selectedBooking.amount, 
        payment_method: paymentMethod,
        transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      setNotif({ message: 'Payment successful!', type: 'success' });
      setShowPay(false);
      loadBookings();
    } catch {
      setNotif({ message: 'Payment failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setNotif({ message: 'Please select a rating', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      // Submit rating
      await submitRating({ 
        booking: selectedBooking.id, 
        score: rating, 
        comment: comment.trim() || null 
      });

      // Also submit as feedback if comment provided
      if (comment.trim()) {
        try {
          await submitFeedback({
            booking: selectedBooking.id,
            mechanic: selectedBooking.mechanic,
            content: comment.trim()
          });
        } catch {
          // Feedback is optional, don't fail if it errors
        }
      }

      setShowRate(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setRating(0);
      setComment('');
      loadBookings();
    } catch (err) {
      const msg = err?.response?.data?.booking?.[0] || err?.response?.data?.detail || 'Failed to submit rating';
      setNotif({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value) => {
    const labels = { 1: 'Terrible', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent!' };
    return labels[value] || 'Tap to rate';
  };

  const getRatingColor = (value) => {
    const colors = { 1: 'text-red-500', 2: 'text-orange-500', 3: 'text-amber-500', 4: 'text-emerald-500', 5: 'text-emerald-600' };
    return colors[value] || 'text-slate-400';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {notif && <Notification {...notif} onClose={() => setNotif(null)} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Booking History</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 font-semibold">Track your previous services and manage payments.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {['ALL', 'ACTIVE', 'COMPLETED'].map(f => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${f === activeFilter ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20"><Loader /></div>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-2 bg-slate-50/50">
          <div className="w-20 h-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-200">
            <ClipboardList size={40} />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest italic tracking-wider opacity-60">
            {activeFilter === 'ALL' ? "You haven't made any bookings yet." : `No ${activeFilter.toLowerCase()} bookings.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b, i) => (
            <BookingCard 
              key={b.id} 
              booking={b} 
              index={i} 
              role="ROLE_CUSTOMER" 
              onAction={(type, data) => {
                setSelectedBooking(data);
                if (type === 'PAY') setShowPay(true);
                if (type === 'RATE') { setRating(0); setComment(''); setShowRate(true); }
              }} 
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Payment Modal                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPay(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-8 md:p-12 w-full max-w-xl shadow-3xl relative z-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-500" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                  <Shield size={32} strokeWidth={2.5} />
                </div>
                <button onClick={() => setShowPay(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="text-left mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Checkout</h2>
                <p className="text-slate-500 font-bold">Secure your service with a few clicks.</p>
              </div>

              <div className="bg-slate-50 rounded-[32px] p-6 mb-8 flex items-center justify-between border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="text-3xl font-black text-slate-900">₹{selectedBooking?.amount}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-primary border border-primary/10 shadow-sm uppercase tracking-widest">
                  Order #{selectedBooking?.id}
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Select Payment Method</label>
                
                {[
                  { id: 'UPI', label: 'UPI Payment', sub: 'Google Pay, PhonePe, Paytm', icon: <Smartphone size={20} /> },
                  { id: 'CARD', label: 'Credit / Debit Card', sub: 'Secure via SSL Encryption', icon: <CreditCard size={20} /> },
                  { id: 'CASH', label: 'Cash on Delivery', sub: 'Pay after service completion', icon: <Banknote size={20} /> }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full group flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 border-2 ${
                      paymentMethod === method.id 
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      paymentMethod === method.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600 shadow-sm'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-black tracking-tight ${paymentMethod === method.id ? 'text-primary' : 'text-slate-700'}`}>{method.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wide">{method.sub}</p>
                    </div>
                    <ChevronRight size={18} className={`transition-transform duration-300 ${paymentMethod === method.id ? 'text-primary translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 font-bold h-16 rounded-2xl" onClick={() => setShowPay(false)}>Cancel</Button>
                <Button 
                  className="flex-[2] font-black h-16 rounded-2xl shadow-2xl shadow-primary/30 text-lg italic tracking-tight" 
                  loading={isSubmitting} 
                  onClick={handlePay}
                  rightIcon={<Shield size={20} />}
                >
                  Confirm & Pay
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />)}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Trusted by 10,000+ Customers
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Rating & Feedback Modal                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRate(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 50, opacity: 0, scale: 0.95 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-[40px] p-8 md:p-12 w-full max-w-lg shadow-3xl relative z-10 overflow-y-auto overflow-x-hidden max-h-[90vh] custom-scrollbar"
            >
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-amber-50/50 blur-3xl" />

              {/* Close button */}
              <button 
                onClick={() => setShowRate(false)} 
                className="absolute top-6 right-6 p-2.5 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-600 z-10"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-8 relative z-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-amber-100 to-orange-100 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100/50"
                >
                  <Sparkles size={36} strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Rate Your Experience</h2>
                <p className="text-slate-500 font-semibold text-sm">
                  How was your service with <span className="font-black text-slate-700">{selectedBooking?.mechanic_name || 'the mechanic'}</span>?
                </p>
              </div>

              <form onSubmit={handleRate} className="space-y-8 relative z-10">
                
                {/* Emoji Rating Selector */}
                <div className="text-center">
                  <div className="flex justify-center gap-3 mb-4">
                    {[
                      { value: 1, emoji: '😞', label: 'Terrible' },
                      { value: 2, emoji: '😕', label: 'Poor' },
                      { value: 3, emoji: '😐', label: 'Average' },
                      { value: 4, emoji: '😊', label: 'Good' },
                      { value: 5, emoji: '🤩', label: 'Excellent!' },
                    ].map(item => (
                      <motion.button 
                        key={item.value}
                        type="button" 
                        onClick={() => setRating(item.value)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${
                          rating === item.value 
                            ? 'bg-amber-50 shadow-lg shadow-amber-100/50 scale-110 border-2 border-amber-200' 
                            : 'hover:bg-slate-50 border-2 border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span className={`text-3xl transition-all ${rating === item.value ? 'grayscale-0' : 'grayscale'}`}>
                          {item.emoji}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Star display */}
                  <div className="flex justify-center gap-1.5 mb-2">
                    {[1,2,3,4,5].map(n => (
                      <motion.button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star 
                          size={28} 
                          className={`transition-all duration-300 cursor-pointer ${n <= rating ? 'text-amber-400 drop-shadow-md' : 'text-slate-200 hover:text-slate-300'}`}
                          fill={n <= rating ? 'currentColor' : 'none'}
                          strokeWidth={2}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Rating label */}
                  <AnimatePresence mode="wait">
                    {rating > 0 && (
                      <motion.p 
                        key={rating}
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -5 }}
                        className={`text-sm font-black uppercase tracking-widest ${getRatingColor(rating)}`}
                      >
                        {getRatingLabel(rating)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Feedback text area */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                    <MessageSquare size={12} />
                    Share your experience
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-medium focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none resize-none" 
                      rows="3" 
                      placeholder="What did you like? Any suggestions for improvement..." 
                      value={comment} 
                      onChange={e => setComment(e.target.value)} 
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-300">
                      {comment.length}/500
                    </div>
                  </div>
                </div>

                {/* Booking info summary */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <ClipboardList size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking #{selectedBooking?.id}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{selectedBooking?.service_name || 'Service'}</p>
                  </div>
                  {selectedBooking?.amount > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{selectedBooking?.amount}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <Button 
                    variant="ghost" 
                    type="button" 
                    className="flex-1 font-bold h-14 rounded-2xl" 
                    onClick={() => setShowRate(false)}
                  >
                    Skip
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] font-black h-14 rounded-2xl shadow-xl shadow-amber-200/40 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white" 
                    loading={isSubmitting}
                    disabled={rating === 0}
                    rightIcon={<ThumbsUp size={18} />}
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Success Toast Animation                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300]"
          >
            <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-600/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="font-black tracking-tight">Thank you for your feedback!</p>
                <p className="text-emerald-100 text-xs font-semibold">Your review helps improve our services.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
