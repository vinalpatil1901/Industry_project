import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Truck, 
  BookOpen
} from 'lucide-react';

export default function MarketplaceModal({ item, onClose, onAddToCart }) {
  const [reserved, setReserved] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState("campus_locker");
  const [chatOpened, setChatOpened] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messagesList, setMessagesList] = useState([
    { sender: "seller", text: `Hi! Yes, the "${item?.title?.slice(0, 32)}..." is available and kept in mint condition. Are you free for pickup today?` }
  ]);

  if (!item) return null;

  const handleReserve = () => {
    setReserved(true);
    if (onAddToCart) onAddToCart(item);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessagesList(prev => [...prev, { sender: "user", text: chatMessage }]);
    setChatMessage("");
    setTimeout(() => {
      setMessagesList(prev => [
        ...prev, 
        { sender: "seller", text: "Got it! I can leave it at the Campus360 Smart Locker or meet at the library cafeteria at 4 PM." }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Campus360 Student Marketplace
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                Second-Hand Academic Listing
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Book/Item Details */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-full sm:w-36 h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/80 flex flex-col items-center justify-center p-3 text-center shrink-0 shadow-inner">
              <BookOpen className="w-12 h-12 text-blue-600 mb-2" />
              <span className="text-[11px] font-semibold text-blue-800 line-clamp-2">
                {item.category}
              </span>
              <span className="mt-2 text-[10px] bg-white/80 font-bold px-2 py-0.5 rounded-full text-blue-900 border border-blue-200">
                {item.semester}
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${item.conditionColor}`}>
                  {item.condition}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {item.discount}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Track: {item.careerTrack}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {item.title}
              </h2>

              <p className="text-xs text-slate-600 font-medium">
                Author / Publisher: <span className="text-slate-800 font-semibold">{item.authors}</span>
              </p>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-slate-900">
                  ₹{item.secondHandPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm line-through text-slate-400 font-medium">
                  MRP ₹{item.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Save ₹{(item.originalPrice - item.secondHandPrice).toLocaleString('en-IN')}!
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="font-semibold text-slate-800">Student Notes:</span> {item.highlight}
              </p>
            </div>
          </div>

          {/* Senior Student Seller Profile */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full ${item.seller.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                {item.seller.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{item.seller.name}</h4>
                  {item.seller.isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Verified Senior
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{item.seller.campus}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-800">{item.seller.rating}</span>
                  <span className="text-[11px] text-slate-500">({item.seller.reviewsCount} peer reviews)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setChatOpened(!chatOpened)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              {chatOpened ? "Hide Chat" : "Chat with Seller"}
            </button>
          </div>

          {/* Interactive Chat Drawer */}
          {chatOpened && (
            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Live Campus Messaging with {item.seller.name}
              </div>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {messagesList.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] text-xs rounded-xl px-3 py-2 ${
                      m.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about book condition, notes, or meetup..."
                  className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Campus Handover & Locker Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Choose Campus Handover / Locker Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPickup("campus_locker")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPickup === "campus_locker"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Campus360 Smart Locker</span>
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Placed in secure campus locker with OTP code release (Zero contact).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPickup("direct_meet")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPickup === "direct_meet"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Direct Campus Meetup</span>
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {item.pickup} (Inspect before payment).
                </p>
              </button>
            </div>
          </div>

          {/* Campus360 Buyer Protection Guarantee */}
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 leading-relaxed">
              <span className="font-bold">Campus360 Escrow Protection:</span> Your funds are held securely until you receive the book and verify its pages/condition. 24-hour return policy if book condition doesn't match description.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Payable Amount</div>
            <div className="text-lg font-black text-slate-900">
              ₹{item.secondHandPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleReserve}
              disabled={reserved}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                reserved
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95"
              }`}
            >
              {reserved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Reserved in Campus Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Reserve Book on Campus
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
