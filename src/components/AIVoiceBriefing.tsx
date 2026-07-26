import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, RefreshCw, Sparkles, Radio } from "lucide-react";
import { toast } from "sonner";

interface AIVoiceBriefingProps {
  commanderName?: string;
}

export const AIVoiceBriefing: React.FC<AIVoiceBriefingProps> = ({ commanderName = "Commissioner" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);

  const briefingText = `Good evening ${commanderName}. AI Intelligence Telemetry report for current command cycle: 11 active cases across 9 states with 2 critical alerts requiring tactical action. CCTV uptime is 91 point 7 percent with 8 out of 8 officer shifts approved. Patrol units 42 and 44 are en route to Jayanagar and Karol Bagh. Neural pattern detector flags potential cross-district robbery link.`;

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  const handleToggleSpeech = () => {
    if (!speechSynth) {
      toast.info("AI Executive Speech Synthesizer active in audio preview mode.");
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isPlaying) {
      speechSynth.cancel();
      setIsPlaying(false);
      toast.info("AI Voice Briefing paused.");
    } else {
      speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(briefingText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynth.speak(utterance);
      setIsPlaying(true);
      toast.success("Playing AI Voice Executive Briefing...");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-2/80 p-4 flex items-center justify-between flex-wrap gap-4 reveal">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`size-10 rounded-xl flex items-center justify-center font-bold transition-all ${
          isPlaying ? "bg-primary text-primary-foreground animate-pulse shadow-glow" : "bg-surface border border-border text-primary"
        }`}>
          {isPlaying ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="size-3" /> REAL-TIME AI BRIEFING
            </span>
            {isPlaying && (
              <span className="text-[10px] font-mono text-success flex items-center gap-1">
                <Radio className="size-3 pulse-dot" /> AUDIO STREAMING
              </span>
            )}
          </div>
          <p className="text-xs text-foreground font-semibold truncate mt-0.5">
            "{briefingText.substring(0, 85)}…"
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Soundwave animation */}
        {isPlaying && (
          <div className="flex items-center gap-1 h-5 px-2">
            {[40, 80, 60, 100, 50, 90, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleToggleSpeech}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            isPlaying
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
          }`}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          <span>{isPlaying ? "Pause AI Audio" : "Play AI Briefing"}</span>
        </button>
      </div>
    </div>
  );
};
