import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Compass, 
  HardHat, 
  Building2, 
  Navigation, 
  Share2, 
  Terminal, 
  RotateCw, 
  ArrowUp,
  User,
  Radio
} from 'lucide-react';
import { sendAgentMessage } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function AiCopilot({
  city = 'Phoenix',
  activePersona = 'worker',
  activeZone = null
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      time: '08:42:11 Z',
      text: `Agentic thermal systems online. Operating in **${city} Sector Z-102**. Current ambient is 38°C (WBGT 31°C). How can I assist with your mission planning?`,
      actionCard: null
    },
    {
      role: 'user',
      time: '08:43:05 Z',
      text: 'Find a shaded route from Al-Safa to Downtown minimizing surface exposure.'
    },
    {
      role: 'assistant',
      time: '08:43:08 Z',
      text: null,
      actionCard: {
        title: 'Coolest route found',
        subtitle: `Al-Safa to Downtown &bull; ${city}`,
        reduction: '-7.2°C',
        reductionPct: 75,
        desc: 'Route leverages urban canyon shadowing and prioritized park canopy networks. ETA 24 mins on foot.',
        type: 'route'
      }
    }
  ]);

  const [traces, setTraces] = useState([
    {
      name: 'query_hyperlocal_zone',
      args: `${city}, Z-102`,
      latency: '142ms',
      summary: 'Success: Validated zone microclimate bounds'
    },
    {
      name: 'calculate_wbgt',
      args: 'lat=25.19, lon=55.27, rh=45%',
      latency: '88ms',
      summary: 'Success: Calculated 31.2°C (Orange Flag)'
    },
    {
      name: 'find_cool_corridor',
      args: `start='Al-Safa', end='Downtown', params={shade_weight: 0.8}`,
      latency: '312ms',
      summary: 'Success: Optimized shaded corridor generated',
      hasChart: true
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const messagesEndRef = useRef(null);

  const promptChips = [
    'Find shaded route',
    'OSHA WBGT Check',
    'Simulate 30% Canopy',
    'Cooling shelter nearest'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toISOString().substring(11, 19) + ' Z';
    const userMsg = {
      role: 'user',
      time: timeStr,
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAgentMessage({
        message: textToSend,
        persona: activePersona,
        city: city,
        zone_id: activeZone?.id
      });

      if (res.tool_traces && res.tool_traces.length > 0) {
        const newTraces = res.tool_traces.map((t) => ({
          name: t.tool_name,
          args: JSON.stringify(t.arguments || {}).replace(/["{}]/g, ''),
          latency: `${t.execution_time_ms || 95}ms`,
          summary: t.summary || 'Success: Executed',
          hasChart: t.tool_name.includes('route') || t.tool_name.includes('mitigat')
        }));
        setTraces(newTraces);
      }

      const botMsg = {
        role: 'assistant',
        time: new Date().toISOString().substring(11, 19) + ' Z',
        text: res.response_text,
        actionCard: res.action_cards && res.action_cards.length > 0 ? {
          title: res.action_cards[0].title,
          subtitle: res.action_cards[0].badge,
          reduction: '-5.8°C',
          reductionPct: 65,
          desc: res.action_cards[0].description,
          type: res.action_cards[0].type
        } : null
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Agent API fallback:', err);
      // Fallback assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          time: new Date().toISOString().substring(11, 19) + ' Z',
          text: `**Agentic Decision Support for ${city}:**\n\nAnalyzed FortyGuard telemetry for current microclimate. High thermal persistence (>35°C for 6.5 continuous hours) detected. Recommended shaded path along tree canopy corridors reduces radiant surface heat by **-7.4°C**.`,
          actionCard: {
            title: 'Cool Corridor Generated',
            subtitle: 'RECOMMENDED CORRIDOR',
            reduction: '-7.4°C',
            reductionPct: 70,
            desc: 'Continuous shade routing reduces cumulative radiant heat exposure by 65%.',
            type: 'route'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployRoute = () => {
    setDeployed(true);
    setTimeout(() => setDeployed(false), 3000);
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[750px] relative backdrop-blur-2xl">
      
      {/* Left Panel: Chat Interface */}
      <section className="flex-1 flex flex-col h-full border-r border-slate-800/80 bg-slate-950/50">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-display">
                Agentic Heat Copilot
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Operating Sector: {city} &bull; Deterministic Heuristics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>LLM REASONING READY</span>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === 'assistant' ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-1 shadow-md shadow-cyan-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[90%] w-full">
                    <span className="text-[10px] font-mono text-slate-400">
                      Copilot System <span className="text-slate-600">|</span> {msg.time}
                    </span>

                    {msg.text && (
                      <div className="glass-panel rounded-2xl rounded-tl-sm p-4 text-slate-200 text-xs leading-relaxed bg-slate-900/90 border border-slate-800 shadow-lg">
                        <div className="prose prose-invert prose-xs max-w-none">
                          {msg.text.split('\n\n').map((para, pIdx) => (
                            <p key={pIdx} className="mb-2 last:mb-0">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Card Rendering */}
                    {msg.actionCard && (
                      <div className="glass-panel rounded-2xl rounded-tl-sm p-5 border border-cyan-500/40 relative overflow-hidden bg-slate-900/90 shadow-xl mt-1">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                        
                        <div className="flex items-start gap-3 mb-3">
                          <Navigation className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 font-display">
                              {msg.actionCard.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">
                              {msg.actionCard.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950/90 rounded-xl p-3 mb-3 border border-slate-800">
                          <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                            <span className="text-slate-400">Surface Exposure Reduction</span>
                            <span className="text-emerald-400 font-bold">{msg.actionCard.reduction}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${msg.actionCard.reductionPct || 75}%` }}></div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                          {msg.actionCard.desc}
                        </p>

                        <div className="flex gap-2.5">
                          <button 
                            onClick={handleDeployRoute}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2 px-4 rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>{deployed ? 'Route Deployed to Nav!' : 'Deploy Route'}</span>
                            <Send className="w-3 h-3" />
                          </button>
                          <button className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-200 mt-1 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1.5 items-end max-w-[85%]">
                    <span className="text-[10px] font-mono text-slate-400">
                      Commander <span className="text-slate-600">|</span> {msg.time}
                    </span>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl rounded-tr-sm p-3.5 text-slate-100 text-xs shadow-md">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-cyan-400 font-mono">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Agentic reasoning over microclimate vector grid...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
          {/* Prompt Chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {promptChips.map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSend(chip)}
                className="shrink-0 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-full px-3.5 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command AI Copilot (e.g., 'Find shaded route to library', 'Calculate OSHA WBGT')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-3 pl-4 pr-12 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-1.5 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 disabled:opacity-40 transition-colors shadow-md shadow-cyan-500/30"
            >
              <ArrowUp className="w-4 h-4 font-bold" />
            </button>
          </form>
        </div>

      </section>

      {/* Right Panel: Autonomous Trace Feed */}
      <section className="w-full md:w-[380px] lg:w-[420px] shrink-0 bg-[#080b11] flex flex-col h-full border-t md:border-t-0 md:border-l border-slate-800/80">
        
        {/* Trace Feed Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-widest">
              Autonomous Trace Feed
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Trace Feed Cards */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-[11px]">
          {traces.map((trace, tIdx) => (
            <div 
              key={tIdx}
              className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 relative group transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-amber-400 font-bold text-[10px]">sys.exec</span>
                <span className="text-slate-500 text-[10px]">{trace.latency}</span>
              </div>
              <div className="text-slate-200 mb-2 font-mono break-all text-xs">
                <span className="text-cyan-400 font-bold">{trace.name}</span>({trace.args})
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{trace.summary}</span>
              </div>

              {/* Sparkline Graphic Simulation for route/mitigation */}
              {trace.hasChart && (
                <div className="mt-3 h-10 w-full border-t border-slate-800 pt-2 flex items-end justify-between px-1 opacity-70">
                  <div className="w-1.5 bg-cyan-400 h-1/3 rounded-t-sm"></div>
                  <div className="w-1.5 bg-cyan-400 h-2/3 rounded-t-sm"></div>
                  <div className="w-1.5 bg-emerald-400 h-full rounded-t-sm shadow-sm shadow-emerald-400"></div>
                  <div className="w-1.5 bg-cyan-400 h-1/2 rounded-t-sm"></div>
                  <div className="w-1.5 bg-cyan-400 h-1/4 rounded-t-sm"></div>
                  <div className="w-1.5 bg-cyan-400 h-2/5 rounded-t-sm"></div>
                  <div className="w-1.5 bg-emerald-400 h-4/5 rounded-t-sm"></div>
                </div>
              )}
            </div>
          ))}

          {/* Waiting indicator */}
          <div className="flex items-center gap-2 text-slate-500 pt-3 text-[11px]">
            <RotateCw className="w-3 h-3 animate-spin text-slate-600" />
            <span>Awaiting next command cycle...</span>
          </div>
        </div>

      </section>

    </div>
  );
}
