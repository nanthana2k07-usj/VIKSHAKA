import React, { useState } from "react";
import { ShieldAlert, X, AlertTriangle, Radio, Car, Lock, Megaphone, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface MassEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MassEmergencyModal: React.FC<MassEmergencyModalProps> = ({ isOpen, onClose }) => {
  const [selectedActions, setSelectedActions] = useState<string[]>([
    "dispatch", "facial", "lockdown"
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const toggleAction = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleExecute = () => {
    if (selectedActions.length === 0) {
      toast.error("Please select at least one response protocol.");
      return;
    }
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsDone(true);
      toast.error("RED ALERT EXECUTED ACROSS ALL COMMAND SECTORS!");
    }, 2500);
  };

  const resetModal = () => {
    setIsDone(false);
    setIsExecuting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border-2 border-destructive bg-surface shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 bg-destructive/10 border-b border-destructive/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center font-bold animate-pulse">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-destructive uppercase tracking-widest font-bold">
                HIGH LEVEL PROTOCOL · LEVEL 4 EMERGENCY
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">TRIGGER MASS RED ALERT RESPONSE</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isDone ? (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Activating this protocol dispatches mass command signals to all 12 patrol units, engages automated toll gate lockdown, and initiates biometric CCTV sweeps.
              </p>

              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Select Emergency Protocols to Engage:
                </label>

                {[
                  { id: "dispatch", title: "Mass PCR Unit Dispatch", desc: "Deploy all 12 active PCR Vans to critical sectors immediately.", icon: Car },
                  { id: "facial", title: "CCTV Biometric & ANPR Facial Matrix", desc: "Enable 100% facial scanning on all 112 city CCTV streams.", icon: Radio },
                  { id: "lockdown", title: "City Exit & Toll Gate Lockdown", desc: "Signal state border checkpoints & toll plazas under IPC 144.", icon: Lock },
                  { id: "broadcast", title: "Emergency Public Broadcast", desc: "Send citizen alert push notification to high-density areas.", icon: Megaphone },
                ].map((act) => {
                  const Icon = act.icon;
                  const active = selectedActions.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleAction(act.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        active
                          ? "border-destructive bg-destructive/10 shadow-sm"
                          : "border-border bg-surface-2 hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {}}
                        className="mt-1 size-4 accent-destructive rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${active ? "text-destructive" : "text-muted-foreground"}`} />
                          <h4 className="font-display text-sm font-bold">{act.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                >
                  {isExecuting ? "Engaging Red Alert..." : "CONFIRM RED ALERT COMMAND"}
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-4 reveal">
              <div className="size-16 rounded-2xl bg-destructive/20 text-destructive mx-auto flex items-center justify-center border border-destructive/40">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="font-display text-xl font-bold">MASS EMERGENCY PROTOCOL ENGAGED</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Command signals dispatched to all 12 PCR Vans, state toll plazas, and CCTV facial matrix engines.
              </p>
              <button
                onClick={resetModal}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
              >
                Return to Dashboard Overview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
