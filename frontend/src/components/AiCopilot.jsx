import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, CheckCircle2, ChevronRight, AlertTriangle, Shield, Clock, Compass, HardHat, Building2 } from 'lucide-react';
import { sendAgentMessage } from '../services/api';
import DataSourceBadge from './DataSourceBadge';

export default function AiCopilot({
  isOpen,
  onClose,
  city,
  activePersona,
  activeZone,
  onTriggerAction
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your **HeatShield AI Copilot**, powered by FortyGuard hyperlocal temperature intelligence.\n\nI can calculate deterministic heat risks, optimize shaded pedestrian routes, compute OSHA WBGT work-rest intervals, and simulate urban mitigation scenarios. How can I protect you today?`,
      toolTraces: [],
      actionCards: [],
      suggestedFollowups: [
        'Find a shaded Cool Route',
        'Calculate OSHA WBGT work-rest intervals',
        'Simulate 25% urban tree canopy ROI',
        'Where is the nearest cooling center?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

      const botMsg = {
        role: 'assistant',
        text: res.response_text,
        toolTraces: res.tool_traces || [],
        actionCards: res.action_cards || [],
        suggestedFollowups: res.suggested_followups || [],
        heatshield_score: res.heatshield_score,
        risk_level: res.risk_level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Agent Execution Warning**: Could not connect to the decision engine. Please verify the backend service is running.`,
          toolTraces: [],
          actionCards: [],
          suggestedFollowups: ['Try again'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-dark-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Bot className="w-4 h-4 text-dark-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-100">
                HeatShield AI Copilot
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Agentic AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: {city} • Persona: {activePersona}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="text-[10px] text-slate-500 px-1">{m.timestamp}</div>

            {/* Message Bubble */}
            <div
              className={`p-3.5 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-amber-500 text-dark-900 font-medium rounded-tr-sm shadow-md'
                  : 'glass-panel border border-slate-800 text-slate-200 rounded-tl-sm bg-dark-850/90 shadow-lg'
              }`}
            >
              {/* If Assistant: Render Tool Traces Badge Timeline */}
              {m.toolTraces && m.toolTraces.length > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-dark-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Autonomous Agent Tool Execution Trace
                  </div>
                  <div className="space-y-1 text-[10px] font-mono text-slate-300">
                    {m.toolTraces.map((t, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-emerald-300 font-bold">[{t.tool_name}]</span>
                          <span className="text-slate-400 ml-1">({t.execution_time_ms}ms)</span>: {t.summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Text */}
              <div className="whitespace-pre-line prose prose-invert prose-xs">
                {m.text}
              </div>

              {/* Render Action Cards */}
              {m.actionCards && m.actionCards.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.actionCards.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-xl bg-dark-900 border border-amber-500/30 space-y-1.5 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-300">{card.title}</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{card.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Follow-up suggestion chips */}
            {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                {m.suggestedFollowups.map((f, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleSend(f)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-dark-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 hover:border-amber-500/40 transition-all flex items-center gap-1"
                  >
                    <span>{f}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-2xl glass-panel w-fit bg-dark-850/80">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Agent querying FortyGuard intelligence and reasoning over microclimate risks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3.5 border-t border-slate-800 bg-dark-850">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot for route, WBGT, or mitigation..."
            disabled={loading}
            className="flex-1 bg-dark-900 text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-dark-900 font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
