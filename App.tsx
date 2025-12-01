
import React, { useState } from 'react';
import { Sparkles, Search, AlertCircle, Loader2, BookOpen, BrainCircuit, ShieldCheck } from 'lucide-react';
import { getAnimeRecommendations } from './services/geminiService';
import { SearchState, SearchMode } from './types';
import AnimeCard from './components/AnimeCard';

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [mode, setMode] = useState<SearchMode>('strict');
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    error: null,
    results: [],
    hasSearched: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await getAnimeRecommendations(input, mode);
      setState({
        isLoading: false,
        error: null,
        results: data,
        hasSearched: true,
      });
    } catch (err: any) {
      setState({
        isLoading: false,
        error: "Une erreur est survenue lors de la communication avec l'Oracle. Veuillez vérifier votre clé API ou réessayer.",
        results: [],
        hasSearched: true,
      });
    }
  };

  const suggestions = [
    "Anime sombre, psychologique comme Monster...",
    "Romance drôle sans clichés...",
    "Aventure épique avec belle animation...",
    "Cyberpunk dystopique style années 90..."
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">DeepAnime</h1>
              <p className="text-xs text-indigo-400 font-medium">RECOMMANDATIONS VÉRIFIÉES</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 border border-slate-800 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Powered by Gemini 2.5 & Google Grounding
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12">
        
        {/* Intro / Search Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Découvrez votre prochain <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Chef-d'œuvre
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            Décrivez vos goûts, votre humeur ou vos favoris. L'Oracle consulte les bases de données officielles pour éviter toute hallucination.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            
            {/* Input Area */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-2 flex flex-col gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Je cherche un thriller psychologique sombre comme Death Note, mais avec un cadre de science-fiction..."
                className="w-full bg-transparent text-white placeholder-slate-500 p-4 outline-none resize-none h-24 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />
              
              <div className="flex flex-col md:flex-row justify-between items-center px-2 pb-2 gap-3">
                {/* Creativity Toggle */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setMode('strict')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      mode === 'strict' 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    Fiable
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('creative')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      mode === 'creative' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BrainCircuit size={14} />
                    Découverte
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={state.isLoading || !input.trim()}
                  className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {state.isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Chercher</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Suggestions */}
          {!state.hasSearched && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error State */}
        {state.error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3 mb-8 animate-fadeIn">
            <AlertCircle className="shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        {/* Results Section */}
        {state.results.length > 0 && (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-indigo-400" size={20} />
              <h3 className="text-xl font-bold text-white">
                Résultats {mode === 'strict' ? 'Vérifiés' : 'Découverte'}
              </h3>
              <div className="h-px bg-slate-800 flex-grow ml-4"></div>
            </div>
            
            <div className="space-y-6">
              {state.results.map((anime, index) => (
                <AnimeCard key={`${anime.title}-${index}`} anime={anime} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State after search */}
        {state.hasSearched && !state.isLoading && !state.error && state.results.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500">Aucun résultat trouvé. Essayez d'être plus précis ou de changer vos critères.</p>
          </div>
        )}

      </main>
      
      {/* Global CSS for simplistic animations if Tailwind config not fully modifying index.css */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
