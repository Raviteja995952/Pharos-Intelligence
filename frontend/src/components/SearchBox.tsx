import { useState } from 'react';
import { Search, Loader2, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBoxProps {
  onSearch: (query: string, type: string, secondaryQuery?: string) => void;
  isLoading: boolean;
  compareMode?: boolean;
}

export function SearchBox({ onSearch, isLoading, compareMode = false }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [secondaryQuery, setSecondaryQuery] = useState('');
  const [type, setType] = useState('wallet');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    { value: 'wallet', label: 'Wallet' },
    { value: 'token', label: 'Token' },
    { value: 'contract', label: 'Contract' },
    { value: 'transaction', label: 'Transaction' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && (!compareMode || secondaryQuery.trim())) {
      onSearch(query.trim(), type, compareMode ? secondaryQuery.trim() : undefined);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-primary/20">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className={`flex-1 grid gap-4 ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter ${compareMode ? 'first ' : ''}${type} address...`}
              className="pl-12 h-14 bg-white/5 border-white/10 focus-visible:ring-emerald-500 text-lg rounded-xl transition-all"
              disabled={isLoading}
            />
          </div>
          {compareMode && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-indigo-400 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input
                value={secondaryQuery}
                onChange={(e) => setSecondaryQuery(e.target.value)}
                placeholder={`Enter second ${type} address...`}
                className="pl-12 h-14 bg-white/5 border-white/10 focus-visible:ring-indigo-400 text-lg rounded-xl transition-all"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-14 px-4 min-w-[140px] bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-100 transition-all flex items-center justify-between"
              disabled={isLoading}
            >
              <span className="capitalize">{type}</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setType(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center ${
                        type === option.value 
                          ? 'bg-emerald-500/10 text-emerald-500 font-medium border-l-2 border-emerald-500' 
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 border-l-2 border-transparent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <Button 
            type="submit" 
            className={`h-14 px-8 rounded-xl font-medium text-md shadow-lg transition-all active:scale-95 ${compareMode ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20 hover:shadow-indigo-500/40' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/40 text-white'}`}
            disabled={!query.trim() || (compareMode && !secondaryQuery.trim()) || isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : compareMode ? 'Compare' : 'Analyze'}
          </Button>
        </div>
      </form>
    </div>
  );
}
