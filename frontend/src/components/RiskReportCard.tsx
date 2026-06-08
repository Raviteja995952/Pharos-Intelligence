import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Activity, BrainCircuit, ExternalLink, Network, Database, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, Share2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface RiskReportCardProps {
  report: any;
}

export function RiskReportCard({ report }: RiskReportCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('findings');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pharos_report_${report.entity}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const ProgressBar = ({ label, value }: { label: string, value: number }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-300">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${value >= 50 ? 'bg-emerald-500' : 'bg-orange-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:text-black">
      
      {/* Action Buttons (Hidden when printing) */}
      <div className="flex justify-end gap-3 mb-2 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-md transition-colors">
          <Download className="h-3 w-3" /> Download PDF
        </button>
        <button onClick={handleExportJSON} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-md transition-colors">
          <Database className="h-3 w-3" /> Export JSON
        </button>
        <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-md transition-colors">
          <Share2 className="h-3 w-3" /> Copy Link
        </button>
      </div>

      {/* Verdict Card (Would I Interact?) */}
      <Card className={`border-2 ${report.verdict === 'YES' ? 'border-emerald-500/50 bg-emerald-500/5' : report.verdict === 'CAUTION' ? 'border-orange-500/50 bg-orange-500/5' : 'border-red-500/50 bg-red-500/5'} overflow-hidden rounded-xl print:border-black print:bg-transparent`}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            {report.verdict === 'YES' ? (
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 text-emerald-500">
                <ShieldCheck className="h-8 w-8" />
              </div>
            ) : report.verdict === 'CAUTION' ? (
              <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50 text-orange-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 text-red-500">
                <ShieldAlert className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">AI Action Verdict</div>
            <div className={`text-2xl font-bold mb-2 ${report.verdict === 'YES' ? 'text-emerald-500' : report.verdict === 'CAUTION' ? 'text-orange-500' : 'text-red-500'}`}>
              {report.verdict === 'YES' ? 'PROCEED' : report.verdict === 'CAUTION' ? 'EXERCISE CAUTION' : 'DO NOT INTERACT'}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl print:text-black">
              {report.verdictReason}
            </p>
          </div>
        </div>
      </Card>

      {/* Header Card / Executive Dashboard (MOVED TO TOP) */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden rounded-xl print:bg-white print:border-gray-200">
        <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
          
          <div className="space-y-4 relative z-10 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase">
              <ShieldCheck className="h-3 w-3" /> Pharos Due Diligence Report
            </div>
            <div>
              <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3 print:text-black">
                {report.entityType} Analysis
                <Badge variant={report.riskLevel === 'Low Risk' ? 'default' : report.riskLevel === 'Medium Risk' ? 'secondary' : 'destructive'} 
                       className="font-mono text-xs px-2 py-0.5 uppercase tracking-wider">
                  {report.riskLevel}
                </Badge>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-zinc-400 font-mono text-sm print:text-gray-600">
                <span className="truncate max-w-[200px] md:max-w-[400px]">{report.entity}</span>
                <button className="hover:text-emerald-400 transition-colors print:hidden" title="View on Block Explorer">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end relative z-10 w-full md:w-auto p-4 md:p-0 bg-zinc-900 md:bg-transparent rounded-xl border md:border-none border-zinc-800">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Intelligence Score</div>
            <div className="flex items-end gap-3">
              <div className={`text-6xl md:text-7xl font-black tracking-tighter leading-none ${
                report.score >= 70 ? 'text-emerald-500' : report.score >= 40 ? 'text-orange-500' : 'text-red-500'
              }`}>
                {report.score}
              </div>
              <div className="flex flex-col pb-2">
                <span className="text-sm text-zinc-500 font-medium">/100</span>
                <span className={`text-xl font-bold ${
                  report.grade === 'A' || report.grade === 'B' ? 'text-emerald-500' : 
                  report.grade === 'C' ? 'text-orange-500' : 'text-red-500'
                }`}>Grade {report.grade}</span>
              </div>
            </div>
            
            {/* Risk Badges */}
            {report.badges && report.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-start md:justify-end max-w-[300px]">
                {report.badges.map((badge: any, i: number) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 font-medium
                    ${badge.color === 'green' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      badge.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'}
                  `}>
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.color === 'green' ? 'bg-emerald-500' : badge.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confidence & Ecosystem Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-zinc-800 bg-zinc-900/50 print:bg-gray-50 print:border-gray-200">
          <div className="p-4 md:px-10 border-b md:border-b-0 md:border-r border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 flex items-center gap-2 print:text-gray-600">
              <Database className="h-4 w-4" /> Confidence Score
            </span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono text-zinc-100 print:text-black">{report.confidence.score}%</span>
              <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden print:hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${report.confidence.score}%` }} />
              </div>
            </div>
          </div>
          <div className="p-4 md:px-10">
            <p className="text-xs text-zinc-500 leading-snug print:text-gray-600">
              {report.confidence.reason}
            </p>
          </div>
        </div>
      </Card>

      {/* Analyst Notes */}
      {report.analystNotes && (
        <Card className="bg-indigo-500/5 border-indigo-500/20 rounded-xl print:bg-white print:border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" />
              Analyst Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-zinc-300 leading-relaxed print:text-black">
              "{report.analystNotes}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Assessment / Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 rounded-xl print:bg-white print:border-gray-200">
          <CardHeader className="border-b border-zinc-800/50 pb-4 bg-zinc-800/20 print:bg-gray-50">
            <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2 print:text-black">
              <BrainCircuit className="h-4 w-4 text-emerald-400" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-zinc-300 text-sm leading-relaxed print:text-black">
            {report.aiAssessment.executiveSummary}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 rounded-xl print:bg-white print:border-gray-200">
          <CardHeader className="border-b border-zinc-800/50 pb-4 bg-zinc-800/20 print:bg-gray-50">
            <CardTitle className="text-sm font-medium text-zinc-100 print:text-black">Beginner Explanation</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-zinc-400 text-sm leading-relaxed print:text-black">
            {report.aiAssessment.beginnerExplanation}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Why This Score & Breakdown */}
        <Card className="bg-zinc-950 border-zinc-800 rounded-xl print:bg-white print:border-gray-200">
          <CardHeader className="border-b border-zinc-800/50 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2 print:text-black">
              <Activity className="h-4 w-4 text-zinc-400" />
              Score Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Why This Score?</h4>
              <ul className="space-y-3">
                {report.scoreImpacts.map((impact: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center text-sm print:text-black">
                    <span className="text-zinc-300 print:text-black">{impact.description}</span>
                    <span className={`font-mono ${impact.value.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{impact.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Risk Breakdown</h4>
              <div className="space-y-4">
                <ProgressBar label="Wallet Age & History" value={report.breakdown.age} />
                <ProgressBar label="Activity Volume" value={report.breakdown.activity} />
                <ProgressBar label="Contract Quality" value={report.breakdown.quality} />
                <ProgressBar label="Behavioral Score" value={report.breakdown.behavior} />
                <ProgressBar label="Network Trust" value={report.breakdown.network} />
              </div>
            </div>

            {report.riskTimeline && report.riskTimeline.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-800/50 print:hidden">
                <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Risk Timeline</span>
                  <span className={`flex items-center gap-1 ${report.riskTrend === 'Improving' ? 'text-emerald-500' : report.riskTrend === 'Worsening' ? 'text-red-500' : 'text-zinc-400'}`}>
                    {report.riskTrend === 'Improving' ? <TrendingUp className="h-3 w-3" /> : report.riskTrend === 'Worsening' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {report.riskTrend}
                  </span>
                </h4>
                <div className="h-32 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.riskTimeline}>
                      <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} 
                        activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Pharos Ecosystem Intelligence */}
          {report.ecosystemIntelligence && (
            <Card className="bg-zinc-950 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)] rounded-xl print:bg-white print:border-emerald-200 print:shadow-none">
              <CardHeader className="border-b border-zinc-800/50 pb-4 bg-emerald-500/5 print:bg-emerald-50">
                <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2 print:text-black">
                  <Network className="h-4 w-4 text-emerald-400" />
                  Pharos Ecosystem Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total Interactions</div>
                    <div className="text-xl font-bold text-zinc-100 print:text-black">{report.ecosystemIntelligence.pharosInteractions}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Unique Contracts</div>
                    <div className="text-xl font-bold text-zinc-100 print:text-black">{report.ecosystemIntelligence.uniqueContracts}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Protocol Diversity</div>
                    <div className="text-xl font-bold text-zinc-100 print:text-black">{report.ecosystemIntelligence.protocolDiversity}%</div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Ecosystem Score</div>
                    <div className="text-xl font-bold text-emerald-400">{report.ecosystemIntelligence.ecosystemScore}/100</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 border-t border-zinc-800/50 pt-4 print:text-black print:border-gray-200">
                  {report.ecosystemIntelligence.assessment}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Whale Analysis for Tokens */}
          {report.whaleAnalysis && (
            <Card className="bg-zinc-950 border-zinc-800 rounded-xl print:bg-white print:border-gray-200">
              <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2 print:text-black">
                  <Database className="h-4 w-4 text-orange-400" />
                  Whale Analysis & Concentration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Top 5 Holders</div>
                    <div className={`text-2xl font-bold ${report.whaleAnalysis.top5 > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {report.whaleAnalysis.top5}%
                    </div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800/50 print:bg-white print:border-gray-200">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Top 10 Holders</div>
                    <div className={`text-2xl font-bold ${report.whaleAnalysis.top10 > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {report.whaleAnalysis.top10}%
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 border-t border-zinc-800/50 pt-4 print:text-black print:border-gray-200">
                  {report.whaleAnalysis.assessment}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Smart Recommendations */}
          <Card className="bg-zinc-950 border-zinc-800 rounded-xl print:bg-white print:border-gray-200">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-sm font-medium text-zinc-100 print:text-black">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {report.smartRecommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300 print:text-black">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Follow-up Questions (Hidden when printing) */}
      <div className="pt-6 border-t border-zinc-800/50 print:hidden">
        <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
          <BrainCircuit className="h-4 w-4" /> Interactive AI Briefing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.questions?.map((q: any, idx: number) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700">
              <button
                onClick={() => toggleSection(`q-${idx}`)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-medium text-sm text-zinc-200">{q.question}</span>
                {expandedSection === `q-${idx}` ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedSection === `q-${idx}` ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 bg-zinc-950/50">
                  {q.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
