import { useState } from 'react';
import { Activity, Search, Shield, GitCompare, PlaySquare } from 'lucide-react';
import { SearchBox } from './components/SearchBox';
import { RiskReportCard } from './components/RiskReportCard';
import { CompareReportCard } from './components/CompareReportCard';

// Mock API function to simulate backend interaction
const analyzeEntity = async (query: string, type: string, isCompare: boolean = false, secondaryQuery?: string) => {
  const endpoint = isCompare ? `http://localhost:3001/analyze/compare` : `http://localhost:3001/analyze/${type}`;
  const body = isCompare 
    ? { address1: query, address2: secondaryQuery, type }
    : type === 'transaction' ? { hash: query } : { address: query };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    let errorMsg = 'Analysis failed';
    try {
      const errorData = await response.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (e) {
      // Ignored if response is not JSON
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export default function App() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cache, setCache] = useState<Record<string, any>>({});
  const [compareMode, setCompareMode] = useState(false);

  const handleSearch = async (query: string, type: string, secondaryQuery?: string) => {
    const cacheKey = compareMode ? `compare-${type}-${query}-${secondaryQuery}` : `${type}-${query.toLowerCase()}`;
    if (cache[cacheKey]) {
      setReport(cache[cacheKey]);
      return;
    }

    setIsLoading(true);
    setError('');
    setReport(null);
    try {
      const data = await analyzeEntity(query, type, compareMode, secondaryQuery);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      setReport(data);
    } catch (err: any) {
      console.error("Frontend Error:", err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />

      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-500 font-bold text-lg tracking-tight">
            <img 
              src="https://docs.pharos.xyz/~gitbook/image?url=https%3A%2F%2F2463199853-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FKKJs3YcSFbFF0lrqt43f%252Flogo%252FFwky2WF6Li1nwFmx1y53%252Fmark.png%3Falt%3Dmedia%26token%3D8629cb4c-6f9e-48b1-bed7-3b22c60ea43d&width=180&height=180&sign=9375677b&sv=2" 
              alt="Pharos Logo" 
              className="h-7 w-7 rounded-[4px]"
            />
            <span className="text-zinc-100 font-mono tracking-wider uppercase text-sm">Pharos<span className="text-emerald-500">Intelligence</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors cursor-pointer">
              <Activity className="h-3.5 w-3.5" />
              <span>SYSTEM: ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-16 pb-24 space-y-12 relative max-w-6xl">
        
        {/* Hero Section */}
        <section className="relative z-20 text-center space-y-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Activity className="h-4 w-4" /> Live on Pharos Network
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
            Pharos Ecosystem <br className="hidden md:block" /> Intelligence Agent
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Institutional-grade AI due diligence for the Pharos ecosystem. Analyze wallets, tokens, and smart contracts instantly.
          </p>
        </section>


        {/* Search Box & Compare Toggle */}
        <section className="relative z-20 space-y-4">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setCompareMode(!compareMode); setReport(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${compareMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              <GitCompare className="h-4 w-4" />
              {compareMode ? 'Comparison Mode Active' : 'Enable Comparative Intelligence'}
            </button>
          </div>
          <SearchBox onSearch={handleSearch} isLoading={isLoading} compareMode={compareMode} />
          {error && (
            <div className="mt-8 text-center text-sm font-mono text-red-400 bg-red-400/10 border border-red-400/20 max-w-2xl mx-auto p-4 rounded-lg">
              [SYSTEM ERROR] {error}
            </div>
          )}
        </section>

        {/* Report Result / Loading Skeleton */}
        <section className="relative z-10 w-full flex justify-center">
          {isLoading && (
            <div className="w-full max-w-5xl space-y-6">
              <div className="h-64 w-full bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 w-full bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
                <div className="h-48 w-full bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
              </div>
            </div>
          )}
          {report && !isLoading && !report.isComparison && (
            <RiskReportCard report={report} />
          )}
          {report && !isLoading && report.isComparison && (
            <CompareReportCard report={report} />
          )}
        </section>

      </main>
    </div>
  );
}
