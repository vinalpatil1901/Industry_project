import React, { useState } from 'react';
import { 
  X, 
  Award, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Calendar,
  DollarSign
} from 'lucide-react';

export default function CollegeDetailModal({ college, onClose }) {
  const [counselingRequested, setCounselingRequested] = useState(false);

  if (!college) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${college.statusColor} bg-white/90`}>
                  {college.status} Institution
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                  ★ {college.rating} Rating
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  {college.ranking}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {college.name}
              </h2>
              <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {college.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Degree & Program Card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Recommended Academic Track
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {college.program}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Duration: <strong className="text-slate-800">{college.duration}</strong>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                Tuition: <strong className="text-slate-800">{college.tuition}</strong>
              </span>
            </div>
          </div>

          {/* Key Placement & Career Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Average Package</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{college.avgPackage}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Highest Package</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">{college.highestPackage}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Placement Rate</div>
              <div className="text-base font-bold text-blue-600 mt-0.5">{college.placementRate}</div>
            </div>
          </div>

          {/* Key Institutional Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Campus & Academic Excellence Highlights
            </h4>
            <div className="space-y-2.5">
              {college.highlights.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alumni & Campus Network */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">Global Alumni Network</span>
            </div>
            <span className="font-bold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200">
              {college.alumniCount}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCounselingRequested(true);
                setTimeout(() => setCounselingRequested(false), 3000);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              {counselingRequested ? "✓ Counseling Request Sent!" : "Request Free Admission Counseling"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
