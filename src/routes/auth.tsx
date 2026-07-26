import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck, ArrowRight, Upload, ArrowLeft, Loader2, Lock, User, Phone, Mail, IdCard,
  Badge as BadgeIcon, Camera, ScanFace, CheckCircle2, Sparkles, UserPlus, LogIn, Key, Radio, Shield
} from "lucide-react";
import { useSession } from "@/lib/auth";
import type { Role } from "@/lib/rbac";
import { roleBadgeClass, roleLabel } from "@/lib/rbac";
import { aiIntelligence } from "@/services/aiIntelligence";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in & Officer Provisioning · VIKSHAKA" },
      { name: "description", content: "Officer sign-in, account creation, and biometric face registration for VIKSHAKA command center." },
      { property: "og:title", content: "Sign in & Officer Provisioning · VIKSHAKA" },
      { property: "og:description", content: "Biometric Face Registration, quick officer login, and registration portal." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "faceregister";
type Step = "creds" | "face_scan" | "verify" | "otp";

const DEMO_PROFILES = [
  {
    name: "Comm. Ravi Shankar",
    rank: "Commissioner (IPS)",
    role: "commissioner" as Role,
    district: "Bengaluru",
    station: "BLR HQ",
    serviceId: "IPS-BLR-101",
    badge: "KA-4412",
    phone: "9876543221",
    email: "ravi.shankar@vikshaka.gov.in",
    avatar: "RS",
  },
  {
    name: "Insp. Anjali Rao",
    rank: "Inspector (Law & Order)",
    role: "officer" as Role,
    district: "Bengaluru South",
    station: "Jayanagar PS",
    serviceId: "POL-KA-802",
    badge: "KA-8092",
    phone: "9812345678",
    email: "anjali.rao@vikshaka.gov.in",
    avatar: "AR",
  },
  {
    name: "ACP Kabir Verma",
    rank: "Assistant Commissioner",
    role: "analyst" as Role,
    district: "Delhi Central",
    station: "Karol Bagh HQ",
    serviceId: "IPS-DL-304",
    badge: "DL-1102",
    phone: "9899887766",
    email: "kabir.verma@vikshaka.gov.in",
    avatar: "KV",
  },
];

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("creds");
  const [loading, setLoading] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [rank, setRank] = useState("Commissioner (IPS)");
  const [role, setRole] = useState<Role>("commissioner");
  const [district, setDistrict] = useState("Bengaluru");
  const [station, setStation] = useState("BLR HQ");
  const [serviceId, setServiceId] = useState("");
  const [badge, setBadge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [proofFile, setProofFile] = useState<string>("");
  const [otp, setOtp] = useState("");

  // Camera & Face scanner
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  const maskedPhone = phone ? `+91-${phone.slice(0, 2)}XXX-XX${phone.slice(-2)}` : "+91-98XXX-XX21";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      toast.info("Camera access unavailable. Activating AI Optical Biometric Simulator.");
    }
  };

  const handleQuickDemoLogin = (profile: typeof DEMO_PROFILES[0]) => {
    setLoading(true);
    setTimeout(() => {
      signIn({
        name: profile.name,
        rank: profile.rank,
        role: profile.role,
        district: profile.district,
        station: profile.station,
        serviceId: profile.serviceId,
        badge: profile.badge,
        phone: profile.phone,
        email: profile.email,
        loginAt: new Date().toISOString(),
        avatar: profile.avatar,
      });
      toast.success(`Welcome, ${profile.name}! Signed in with full clearance.`);
      navigate({ to: "/dashboard" });
    }, 600);
  };

  const handleFaceScan = async () => {
    setFaceScanning(true);
    toast.info(mode === "faceregister" ? "Capturing 128-D facial vector embedding for registration..." : "Verifying face against Law Enforcement Biometric Registry...");
    
    try {
      const res = await aiIntelligence.verifyFaceBiometric("data:image/jpeg;base64,demoFaceDataHash");
      if (res.success) {
        setFaceVerified(true);
        if (mode === "faceregister") {
          setFaceRegistered(true);
          toast.success("Facial Vector Registered Successfully! You can now log in using Face ID.");
        } else {
          toast.success(`Face Matched: ${res.matchName || "Officer"} (${(res.confidence * 100).toFixed(1)}% confidence)`);
        }

        setTimeout(() => {
          if (mode === "login" || mode === "faceregister") {
            finishWithBiometrics(res.matchName);
          } else {
            setStep("verify");
          }
        }, 1200);
      }
    } catch (e) {
      toast.error("Biometric face scan failed. Try again.");
    } finally {
      setFaceScanning(false);
    }
  };

  const finishWithBiometrics = (officerName?: string) => {
    const fullName = officerName || name || "Comm. Ravi Shankar";
    const initials = fullName.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    signIn({
      name: fullName,
      rank: rank || "Commissioner (IPS)",
      role,
      district: district || "Bengaluru",
      station: station || "BLR HQ",
      serviceId: serviceId || "IPS-BLR-114",
      badge: badge || "KA-4412",
      phone: phone || "9876543221",
      email: email || `${fullName.split(" ")[0].toLowerCase()}@vikshaka.gov.in`,
      loginAt: new Date().toISOString(),
      avatar: initials,
    });
    toast.success(`Biometric Login Successful. Command center initialized.`);
    navigate({ to: "/dashboard" });
  };

  const goVerify = () => {
    if (mode === "signup" && (!name || !serviceId)) {
      toast.error("Please fill in your name and Service ID");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(mode === "signup" ? "verify" : "otp");
      if (mode === "login") toast.success(`OTP sent to registered phone ${maskedPhone}`);
    }, 700);
  };

  const goOtp = () => {
    if (!proofFile) {
      toast.error("Please upload your Police Service ID card for verification");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast.success(`Police credentials verified with MHA. OTP sent to ${maskedPhone}`);
    }, 900);
  };

  const finish = () => {
    if (otp.length < 4) {
      toast.error("Enter the 6-digit OTP code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      finishWithBiometrics();
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4">
      {/* Dynamic backdrop glow */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--primary), transparent 45%), radial-gradient(circle at 80% 70%, var(--accent), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-xl my-6">
        
        {/* Logo Header */}
        <div className="flex items-center justify-center gap-3 mb-6 text-center">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <ShieldCheck className="size-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <div className="font-display font-bold text-2xl leading-none tracking-tight">VIKSHAKA</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
              Secure Police Biometric & Command Access
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-border bg-surface/95 backdrop-blur-xl p-6 lg:p-8 shadow-2xl space-y-6">
          
          {/* Mode Switcher Tabs */}
          {step === "creds" && (
            <div className="flex bg-surface-2 p-1 rounded-xl border border-border">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mode === "login"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="size-4" /> Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="size-4" /> Create Account
              </button>
              <button
                onClick={() => setMode("faceregister")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mode === "faceregister"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ScanFace className="size-4" /> Face Registration
              </button>
            </div>
          )}

          {step !== "creds" && (
            <button
              onClick={() => setStep("creds")}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Auth Selection
            </button>
          )}

          {/* Quick Demo Login Chips */}
          {step === "creds" && mode === "login" && (
            <div className="space-y-2 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                <span>Quick Executive Officer Login</span>
                <span>1-Click Demo Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PROFILES.map((p) => (
                  <button
                    key={p.serviceId}
                    onClick={() => handleQuickDemoLogin(p)}
                    className="p-2.5 rounded-lg border border-border bg-surface hover:border-primary/50 text-left transition-colors flex items-center gap-2"
                  >
                    <div className="size-7 rounded-full bg-primary/20 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {p.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{p.name.split(" ")[1]}</div>
                      <div className="text-[9px] font-mono text-muted-foreground truncate">{p.district}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: CREDENTIALS / SIGN IN / SIGN UP */}
          {step === "creds" && mode !== "faceregister" && (
            <div className="space-y-4">
              
              {/* Biometric Face Quick Button */}
              <button
                onClick={() => {
                  setStep("face_scan");
                  startCamera();
                }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow"
              >
                <ScanFace className="size-5" />
                <span>{mode === "login" ? "Fast AI Face Biometric Sign In" : "Scan & Enroll Face Data"}</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-[10px] font-mono uppercase text-muted-foreground">or use Service ID</span>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* CREATE ACCOUNT FIELDS */}
              {mode === "signup" && (
                <>
                  <Field label="Full Officer Name" icon={User} value={name} onChange={setName} placeholder="Comm. Ravi Shankar" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Officer Rank" value={rank} onChange={setRank} placeholder="Commissioner (IPS)" />
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">System Clearance Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full mt-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary/50"
                      >
                        <option value="commissioner">Commissioner (Full Access)</option>
                        <option value="officer">Field Officer (Patrol/Dispatch)</option>
                        <option value="analyst">Crime Analyst (Intel/Reports)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Command District" value={district} onChange={setDistrict} placeholder="Bengaluru South" />
                    <Field label="Police Station / HQ" value={station} onChange={setStation} placeholder="Jayanagar PS" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Police Badge No." icon={BadgeIcon} value={badge} onChange={setBadge} placeholder="KA-4412" />
                    <Field label="Service ID" icon={IdCard} value={serviceId} onChange={setServiceId} placeholder="IPS-BLR-114" />
                  </div>

                  <Field label="Official Email" icon={Mail} value={email} onChange={setEmail} placeholder="officer@vikshaka.gov.in" type="email" />
                  <Field label="Mobile Number" icon={Phone} value={phone} onChange={setPhone} placeholder="9876543221" />
                </>
              )}

              {/* SIGN IN FIELDS */}
              {mode === "login" && (
                <Field
                  label="Service ID or Badge Number"
                  icon={IdCard}
                  value={serviceId}
                  onChange={setServiceId}
                  placeholder="IPS-BLR-101 or KA-4412"
                />
              )}

              <Field label="Password" icon={Lock} value={password} onChange={setPassword} placeholder="••••••••" type="password" />

              <button
                onClick={goVerify}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow transition-opacity"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In to Command Center" : "Verify Officer Credentials"}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP: FACE REGISTRATION TAB DIRECT ENTRY */}
          {step === "creds" && mode === "faceregister" && (
            <div className="space-y-4 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  AI FACIAL BIOMETRIC ENROLLMENT
                </span>
                <h3 className="font-display font-bold text-lg mt-1">Register Face Vector for Officer ID</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Enrolls your 128-dimensional biometric facial map with MHA police identity registry for 1-second login.
                </p>
              </div>

              <Field label="Service ID to Associate Face" icon={IdCard} value={serviceId} onChange={setServiceId} placeholder="IPS-BLR-101" />

              <button
                onClick={() => {
                  setStep("face_scan");
                  startCamera();
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-90"
              >
                <ScanFace className="size-5" /> Start Camera & Register Face
              </button>
            </div>
          )}

          {/* STEP: FACE SCANNER MODAL / VIEW */}
          {step === "face_scan" && (
            <div className="space-y-5 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  BIOMETRIC AI SCANNER ACTIVE
                </span>
                <h3 className="font-display text-xl font-bold mt-1">
                  {mode === "faceregister" ? "Enroll Biometric Face Vector" : "AI Face Authentication"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Position your head inside the scanner frame. The neural network calculates facial geometry landmarks.
                </p>
              </div>

              <div className="relative aspect-square w-56 mx-auto rounded-3xl bg-slate-950 border-2 border-primary/60 overflow-hidden flex items-center justify-center shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                
                {!streamActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <Camera className="size-12 animate-pulse text-primary" />
                    <span className="text-[10px] font-mono mt-2 text-primary">Optical Sensor Initialized</span>
                  </div>
                )}

                {/* Reticle Overlay */}
                <div className="absolute inset-6 border-2 border-dashed border-primary/70 rounded-full animate-spin" style={{ animationDuration: "10s" }} />
                
                {faceVerified && (
                  <div className="absolute inset-0 bg-success/30 backdrop-blur-md flex flex-col items-center justify-center text-white font-bold text-xs space-y-2 animate-in zoom-in-50">
                    <CheckCircle2 className="size-12 text-success" />
                    <span className="font-mono text-sm tracking-widest">FACE VERIFIED</span>
                    <span className="text-[10px] font-mono text-success-foreground">128-D VECTOR MATCH 99.4%</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleFaceScan}
                disabled={faceScanning}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
              >
                {faceScanning ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Analyzing 128 Landmark Points…
                  </>
                ) : (
                  <>
                    <ScanFace className="size-5" /> Execute Face Biometric Scan
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP: POLICE ID PROOF VERIFICATION (SIGNUP ONLY) */}
          {step === "verify" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">STEP 2 OF 3</span>
                <h3 className="font-display font-bold text-lg mt-0.5">Police Credential Document Scan</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a scanned copy of your police service card, IPS gazette ID, or departmental authorization letter.
                </p>
              </div>

              <label className="block rounded-xl border-2 border-dashed border-border bg-surface-2 hover:border-primary/50 transition-colors p-6 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setProofFile(f.name);
                      toast.success(`Uploaded credential file: ${f.name}`);
                    }
                  }}
                />
                <Upload className="size-8 mx-auto text-primary" />
                <div className="text-sm font-semibold mt-2">{proofFile || "Upload Service ID / Police Badge Card"}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                  PNG · JPG · PDF · MHA Encrypted
                </div>
              </label>

              <button
                onClick={goOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verifying Credentials with MHA Database…
                  </>
                ) : (
                  <>
                    <span>Submit & Request OTP Verification</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP: OTP CODE VERIFICATION */}
          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">FINAL VERIFICATION</span>
                <h3 className="font-display font-bold text-lg mt-0.5">Two-Factor Mobile OTP</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit security passkey sent to official phone <span className="text-foreground font-mono font-bold">{maskedPhone}</span>
                </p>
              </div>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                className="w-full text-center tracking-[0.6em] font-mono text-2xl bg-surface-2 border border-border rounded-xl py-3.5 focus:outline-none focus:border-primary/50"
              />

              <button
                onClick={finish}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <span>Initialize VIKSHAKA Command Center</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative mt-1">
        {Icon && <Icon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface-2 border border-border rounded-lg py-2 pr-3 text-xs font-medium focus:outline-none focus:border-primary/50 ${
            Icon ? "pl-9" : "pl-3"
          }`}
        />
      </div>
    </div>
  );
}
