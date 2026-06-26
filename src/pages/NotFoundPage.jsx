import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import './NotFoundPage.css';


export default function NotFoundPage() {
  return (
    <div className="not-found-page page-wrapper py-16 flex items-center justify-center min-h-[75vh]">
      <SEO
        title="404 — Page Not Found"
        description="The page you are looking for does not exist on Pairley. Go back to browse group deals from local restaurants, gyms, salons and retailers."
        noIndex
      />
      <div className="container max-w-2xl mx-auto px-4">

        <motion.div
          className="bg-white/80 backdrop-blur-lg border border-slate-200/80 p-8 md:p-12 rounded-3xl shadow-xl text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated 404 Visuals */}
          <div className="not-found-page__visual relative w-48 h-24 mb-4 flex items-center justify-center">
            <div className="not-found-page__orb absolute w-8 h-8 rounded-full blur-sm" style={{ top: 0, left: 10 }}></div>
            <div className="not-found-page__orb absolute w-12 h-12 rounded-full blur-sm" style={{ bottom: -10, right: 10 }}></div>
            
            <span className="text-6xl md:text-7xl font-black text-slate-200 tracking-wider select-none relative z-10 flex items-center gap-2">
              4
              <div className="not-found-page__heart-wrap relative w-16 h-16 flex items-center justify-center">
                <span className="not-found-page__left-piece">🤝</span>
                <span className="not-found-page__right-piece absolute">❓</span>
              </div>
              4
            </span>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
              Lost in the Pair-verse? 🤷‍♂️
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-3 leading-relaxed">
              We couldn't find a matching partner for this URL. It's searching for a pair, but unfortunately, there's nobody here. Let's get you back to where the matches are!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
            <Link to="/" className="btn btn-primary bg-[#4E2BC4] hover:bg-[#3D1FB3] text-white font-extrabold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-md shadow-indigo-600/10">
              <ArrowLeft size={16} /> Back to Home Feed
            </Link>
            <Link to="/deals" className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Tag size={16} /> Explore Active Deals
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
