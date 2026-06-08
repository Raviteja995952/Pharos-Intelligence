import { GitCompare, Crown, Check, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface CompareReportCardProps {
  report: any;
}

export function CompareReportCard({ report }: CompareReportCardProps) {
  const { entity1, entity2, comparison } = report;

  const renderEntitySummary = (entity: any, title: string) => (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
      {comparison.winner.includes(title) && (
        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-xl border-b border-l border-emerald-500/30 flex items-center gap-1">
          <Crown className="h-3 w-3" /> Winner
        </div>
      )}
      <div className="flex items-center justify-between mb-4 mt-2">
        <h3 className="text-xl font-bold text-zinc-100">{title}</h3>
        <Badge variant="outline" className="font-mono text-xs text-zinc-400 bg-zinc-950 border-zinc-800">
          {entity.entity.substring(0, 6)}...{entity.entity.substring(entity.entity.length - 4)}
        </Badge>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div className="text-5xl font-black text-zinc-100 tracking-tighter">
          {entity.riskScore}
        </div>
        <div className="flex flex-col pb-1">
          <div className="text-sm font-mono text-zinc-500 uppercase">Score</div>
          <div className={`text-sm font-bold ${entity.riskScore >= 70 ? 'text-emerald-500' : entity.riskScore >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
            Grade {entity.grade}
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Wallet Age & History</span>
            <span className="font-mono text-zinc-300">{entity.breakdown.age}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${entity.breakdown.age >= 50 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${entity.breakdown.age}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Activity Volume</span>
            <span className="font-mono text-zinc-300">{entity.breakdown.activity}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${entity.breakdown.activity >= 50 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${entity.breakdown.activity}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Contract Quality</span>
            <span className="font-mono text-zinc-300">{entity.breakdown.quality}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${entity.breakdown.quality >= 50 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${entity.breakdown.quality}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Behavioral Score</span>
            <span className="font-mono text-zinc-300">{entity.breakdown.behavior}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${entity.breakdown.behavior >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${entity.breakdown.behavior}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/50">
        <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Key Signals</h4>
        <div className="space-y-2">
          {entity.keyFindings.slice(0, 3).map((finding: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {entity.positiveSignals.includes(finding) ? (
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-zinc-300">{finding}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Comparative AI Summary */}
      <Card className="bg-zinc-950 border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] overflow-hidden rounded-xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Comparative Intelligence</h2>
              <p className="text-sm font-mono text-indigo-400/80">AI SIDE-BY-SIDE ANALYSIS</p>
            </div>
          </div>
          <div className="text-zinc-300 leading-relaxed text-lg bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-xl">
            {comparison.assessment}
          </div>
        </div>
      </Card>

      {/* Side-by-Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderEntitySummary(entity1, "Entity A")}
        {renderEntitySummary(entity2, "Entity B")}
      </div>
    </div>
  );
}
