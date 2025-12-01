import React, { useState } from 'react';
import { AnimeRecommendation } from '../types';
import { ExternalLink, Calendar, Film, PlayCircle, Info, Star } from 'lucide-react';

interface AnimeCardProps {
  anime: AnimeRecommendation;
  index: number;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300 flex flex-col md:flex-row animate-fadeIn group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image Section */}
      <div className="md:w-1/3 relative overflow-hidden bg-slate-900 min-h-[300px] md:min-h-0">
        {/* Placeholder / Skeleton behind the image */}
        <div className={`absolute inset-0 bg-slate-800 animate-pulse transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
        <img 
          src={anime.imageUrl || `https://placehold.co/400x600/1e293b/cbd5e1?text=${encodeURIComponent(anime.title)}`} 
          alt={anime.title} 
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x600/1e293b/cbd5e1?text=${encodeURIComponent(anime.title)}`;
            setImageLoaded(true);
          }}
        />

        {/* Score Badge */}
        {anime.score && anime.score !== 'N/A' && (
           <div className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-950 px-2 py-1 rounded-md font-bold text-xs flex items-center gap-1 shadow-md backdrop-blur-sm z-10">
             <Star size={12} fill="currentColor" />
             {anime.score}
           </div>
        )}

        {/* Mobile Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 md:hidden pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 md:hidden z-10">
            <h3 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">{anime.title}</h3>
            <p className="text-sm text-indigo-300 italic">{anime.romajiTitle}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="hidden md:block mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white">{anime.title}</h3>
              <p className="text-indigo-300 italic text-sm">{anime.romajiTitle}</p>
            </div>
            {/* Desktop Score (alternative placement or keep only on image) */}
          </div>
        </div>

        {/* Tags / Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-1">
            <Calendar size={12} /> {anime.year}
          </span>
          <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 flex items-center gap-1">
            <Film size={12} /> {anime.studio}
          </span>
          <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 rounded text-xs flex items-center gap-1">
            <PlayCircle size={12} /> {anime.format}
          </span>
          {anime.genres.slice(0, 3).map((g) => (
             <span key={g} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-400 border border-slate-700">
               {g}
             </span>
          ))}
        </div>

        {/* Synopsis */}
        <div className="mb-4">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center gap-1">
            <Info size={12} /> Synopsis Vérifié
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-300">
            {anime.synopsis}
          </p>
        </div>

        {/* Recommendation Reason */}
        <div className="mb-6 p-3 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r-md">
          <p className="text-indigo-200 text-sm italic">
            "{anime.reason}"
          </p>
        </div>

        {/* Footer / Link */}
        <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-500">Source: {anime.sourceUrl.includes('myanimelist') ? 'MyAnimeList' : 'AniList/Official'}</span>
            <a 
              href={anime.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              Fiche Officielle <ExternalLink size={14} />
            </a>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;