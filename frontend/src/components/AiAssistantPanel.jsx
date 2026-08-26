import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, MessageSquare, Terminal } from 'lucide-react';

export default function AiAssistantPanel({ selectedCity }) {
  const [selectedPersona, setSelectedPersona] = useState('worker'); // 'citizen' | 'worker' | 'authority'
  const [inputMessage, setInputMessage] = useState('');
  
  const personaPresets = [
    {
      id: 'citizen',
      label: 'Citizen & Commuter',
      icon: '🚶',
      prompt: 'Find the coolest walking route from Downtown to Transit Plaza at 14:00.',
      reply: {
        toolTraces: [
          'query_hyperlocal_zone(start="Downtown", dest="Transit Plaza")',
          'find_cool_corridor(prefer_shade=True, canopy_weight=0.6)',
          'calculate_exposure(direct_route=44.8°C, shaded_corridor=40.2°C)'
        ],
        text: `I've analyzed the FortyGuard 80m thermal map. Direct 1st Avenue is currently 44.8°C with unshaded asphalt. 

**Recommended Cool Corridor:**
Take the **1st St Shaded Tree Canopy Path**. It reduces ambient thermal exposure by **4.6°C** and avoids radiant surface accumulation. 

Hydration Refill Station available at 1st St & Adams Library.`,
        actionPill: 'Shaded Route Selected: -4.6°C Thermal Relief'
      }
    },
    {
      id: 'worker',
      label: 'Safety Officer / Worker',
      icon: '👷',
      prompt: 'What work-rest cycle is mandated for Warehouse District outdoor crews right now?',
      reply: {
        toolTraces: [
          'query_hyperlocal_zone(zone_id="phx-zone-1")',
          'calculate_wbgt(ambient=44.8°C, surface=61.2°C, solar=960W/m²)',
          'evaluate_work_rest_cycle(wbgt=33.1°C, activity_level="Heavy")'
        ],
        text: `**FortyGuard Live Thermal Conditions for Warehouse District:**
- Ambient Air: 44.8°C | Radiant Surface: 61.2°C
- Calculated WBGT: **33.1°C (Black Flag Extreme Hazard)**

**Mandated Safety Protocols:**
1. **Work / Rest Schedule:** 15 minutes active work / 45 minutes rest per hour.
2. **Hydration Requirement:** Minimum 1 liter of cold electrolyte fluid per worker per hour.
3. **Rest Location:** Mandatory air-conditioned trailer or high-pressure misted canopy.`,
        actionPill: 'Black Flag Protocol Enforced (15m Work / 45m Rest)'
      }
    },
    {
      id: 'authority',
      label: 'City Urban Planner',
      icon: '🏛️',
      prompt: 'Simulate urban heat mitigation for the Warehouse District hotspot.',
      reply: {
        toolTraces: [
          'query_hyperlocal_hotspot(id="hs_phx_01")',
          'simulate_mitigation(canopy_increase_pct=20, cool_roof_albedo=0.65)',
          'calculate_roi(peak_temp_reduction_c=5.4, heat_risk_score_delta=-28)'
        ],
        text: `**Heat Mitigation Simulation Results:**
- **Intervention Package:** 20% mature urban tree canopy addition + cool roof coating on 8 warehouse facilities.
- **Microclimate Impact:**
  - Radiant surface temperature: **-12.8°C drop** (from 61.2°C to 48.4°C).
  - Ambient air temperature: **-3.6°C drop**.
  - HeatShield Operational Risk Score improves from **92 (Extreme)** to **64 (High)**.`,
        actionPill: 'Mitigation Model: -12.8°C Surface Drop Projected'
      }
    }
  ];

  const currentPreset = personaPresets.find((p) => p.id === selectedPersona) || personaPresets[0];

  const [chatLog, setChatLog] = useState([
    {
      role: 'assistant',
      text: currentPreset.reply.text,
      toolTraces: currentPreset.reply.toolTraces,
      actionPill: currentPreset.reply.actionPill,
    }
  ]);

  const handleSelectPreset = (preset) => {
    setSelectedPersona(preset.id);
    setChatLog([
      {
        role: 'user',
        text: preset.prompt
      },
      {
        role: 'assistant',
        text: preset.reply.text,
        toolTraces: preset.reply.toolTraces,
        actionPill: preset.reply.actionPill
      }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');

    setChatLog((prev) => [
      ...prev,
      { role: 'user', text: userMsg },
      {
        role: 'assistant',
        toolTraces: [
          `query_hyperlocal_zone(city="${selectedCity?.name || 'Phoenix'}")`,
          'calculate_operational_risk()',
          'generate_action_recommendation()'
        ],
        text: `Based on FortyGuard hyperlocal intelligence in ${selectedCity?.name || 'Phoenix'}, current conditions show an operational risk score of **88/100 (Extreme)**. 

Please follow shaded Cool Corridors and maintain strict hydration intervals during the peak diurnal window (12:00 - 16:30).`,
        actionPill: 'Real-Time Intelligence Analysis Complete'
      }
    ]);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl mb-6 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">HeatShield AI Decision Copilot</h3>
              <p className="text-xs text-slate-400 font-mono">Agentic Tool Traces & Persona Action Support</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Qwen-2.5 Agentic
          </span>
        </div>

        {/* Persona Selectors */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {personaPresets.map((preset) => {
            const isSelected = selectedPersona === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-orange-500/20 border-orange-500/60 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="text-base mb-1">{preset.icon}</div>
                <div className="text-xs font-bold leading-tight truncate">{preset.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="my-2 space-y-4 max-h-96 overflow-y-auto pr-1">
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[95%] ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white font-medium shadow-md'
                  : 'glass-panel bg-slate-950/90 border border-slate-800 text-slate-200 shadow-xl'
              }`}
            >
              {/* Agent Tool Execution Trace */}
              {msg.toolTraces && (
                <div className="mb-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase text-[10px] mb-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Deterministic Tool Execution Traces</span>
                  </div>
                  {msg.toolTraces.map((trace, tIdx) => (
                    <div key={tIdx} className="flex items-center space-x-1.5 truncate">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{trace}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-line font-sans">{msg.text}</div>

              {/* Action Banner */}
              {msg.actionPill && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{msg.actionPill}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask HeatShield AI (${currentPreset.label} context)...`}
          className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors font-sans"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
