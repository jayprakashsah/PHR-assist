import { useState, useRef, useEffect, cloneElement } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Animated,
} from "react-native";
import {
  HeartPulse,
  ScanLine,
  ShieldAlert,
  MapPin,
  ArrowRight,
  Activity,
  BrainCircuit,
  Smartphone,
  Users,
  Globe,
  Volume2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Upload,
  Zap,
  Lock,
  History,
  TrendingUp,
  Hospital,
  Pill,
  FileText,
  ActivitySquare,
  Thermometer,
  TestTube
} from "lucide-react";
import { translations } from "../translations";

// Helper for responsive typography using clamp (works in RN Web)
const clamp = (min, val, max) => Platform.OS === 'web' ? `clamp(${min}px, ${val}, ${max}px)` : min;

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  em600: "#14b8a6", // Teal base
  em700: "#0f766e",
  em50: "rgba(20, 184, 166, 0.1)",
  em100: "rgba(20, 184, 166, 0.2)",
  em400: "#2dd4bf",
  s50: "#f8fafc",
  s100: "#f1f5f9",
  s200: "#e2e8f0",
  s400: "#94a3b8",
  s500: "#64748b",
  s600: "#475569",
  s900: "#0f172a",
  red50: "#fef2f2",
  red600: "#ef4444",
  red700: "#dc2626",
  white: "#ffffff",
  dark: "#0f172a", // Dark bg
  darkBg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)",
};

export default function LandingPage({
  onGetStarted,
  onActivateSOS,
  lang,
  toggleLang,
}) {
  const t = translations[lang];

  // Floating animation for AI card
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView style={lp.page} showsVerticalScrollIndicator={false}>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <View style={lp.nav}>
        <View style={lp.brand}>
          <HeartPulse size={34} color={C.em600} style={{ filter: 'drop-shadow(0 0 10px rgba(20,184,166,0.8))' }} />
          <Text style={lp.brandName}>SMARTPHR</Text>
        </View>
        <View style={lp.navRight}>
          <TouchableOpacity onPress={toggleLang} style={lp.langChip}>
            <Globe size={14} color={C.white} />
            <Text style={lp.langChipText}>
              {lang === "en" ? "தமிழ்" : "English"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGetStarted} style={lp.signInBtn}>
            <Text style={lp.signInBtnText}>{t.signIn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <View style={lp.hero}>
        {/* Floating UI Env Elements in background */}
        {Platform.OS === 'web' && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hiddenPointer' }}>
            <div style={floatingStyles.floatingOrb1}></div>
            <div style={floatingStyles.floatingOrb2}></div>

            <div style={floatingStyles.floatIcon1}>
              <Activity size={32} color={C.em400} />
            </div>
            <div style={floatingStyles.floatIcon2}>
              <Thermometer size={40} color={C.red600} />
            </div>
            <div style={floatingStyles.floatIcon3}>
              <ScanLine size={36} color="#8b5cf6" />
            </div>
            <div style={floatingStyles.floatIcon4}>
              <ShieldCheck size={48} color={C.em600} />
            </div>
          </View>
        )}

        <View style={lp.heroInner}>
          {/* LEFT COLUMN */}
          <View style={lp.heroLeft}>
            {/* Badges */}
            <View style={lp.badgeRow}>
              <Badge
                icon={<BrainCircuit size={11} color={C.em400} />}
                text={t.scanTitle}
              />
              <Badge
                icon={<ActivitySquare size={11} color={C.em400} />}
                text={"AI DIAGNOSIS"}
              />
              <Badge
                icon={<ShieldCheck size={11} color={C.em400} />}
                text={"HIPAA SECURE"}
              />
            </View>

            <Text style={lp.heroTitle}>SMARTPHR</Text>
            <Text style={lp.heroTag}>{t.heroTitle}</Text>
            <Text style={lp.heroDesc}>The Next Generation of AI-Powered Clinical Intelligence. Unifying medical records, emergency response, and proactive health monitoring.</Text>

            <View style={lp.heroButtons}>
              <TouchableOpacity onPress={onGetStarted} style={lp.primaryBtn}>
                <Zap size={18} color="#fff" fill="#fff" />
                <Text style={lp.primaryBtnText}>{t.getStarted}</Text>
                <ArrowRight size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onActivateSOS} style={lp.sosHeroBtn}>
                <AlertCircle size={18} color="#fff" />
                <Text style={lp.primaryBtnText}>Activate SOS</Text>
              </TouchableOpacity>
            </View>

            {/* AI card removed from here — now floats on heroRight */}
          </View>

          {/* RIGHT COLUMN — 3D Capsule & Interfaces */}
          <View style={lp.heroRight}>
            <View style={lp.floatingCapsuleContainer}>
              <View style={lp.model3DWrapper}>
                <Pill size={160} color={C.em400} style={lp.capsuleMain} />
              </View>
              <View style={lp.modelGlow} />
            </View>

            {/* Floating UI Element 1 */}
            <Animated.View
              style={[
                lp.glassCard,
                {
                  position: "absolute",
                  top: -20,
                  right: -20,
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            >
              <Activity size={20} color={C.em400} />
              <View>
                <Text style={lp.glassCardValue}>98 BPM</Text>
                <Text style={lp.glassCardLabel}>Heart Rate Normal</Text>
              </View>
            </Animated.View>

            {/* Floating UI Element 2 */}
            <Animated.View
              style={[
                lp.aiCard,
                {
                  position: "absolute",
                  bottom: 20,
                  left: -40,
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            >
              <View style={lp.aiCardIcon}>
                <BrainCircuit size={22} color={C.em600} />
              </View>
              <View>
                <Text style={lp.aiCardLabel}>AI Engine Active</Text>
                <Text style={lp.aiCardValue}>Real-Time Scan On</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* ── Problem Section ──────────────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: "rgba(15, 23, 42, 0.4)", position: 'relative' }]}>
        {/* Distressed particle texture background overlay */}
        {Platform.OS === 'web' && (
          <div style={{ ...floatingStyles.problemTexture, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%239C92AC\\" fill-opacity=\\"0.1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"3\\"/%3E%3Ccircle cx=\\"13\\" cy=\\"13\\" r=\\"3\\"/%3E%3C/g%3E%3C/svg%3E")' }}></div>
        )}

        <View style={lp.problemTwoCol}>
          {/* Left: chaotic paper records interface representation */}
          <View style={lp.problemImageCol}>
            <View style={lp.chaosContainer}>
              {Platform.OS === 'web' && (
                <>
                  <div className="chaos-paper" style={floatingStyles.chaosPaper1}></div>
                  <div className="chaos-paper" style={floatingStyles.chaosPaper2}></div>
                  <div className="chaos-paper" style={floatingStyles.chaosPaper3}></div>
                  <div style={floatingStyles.digitalDissolve}></div>
                </>
              )}
              {/* Fallback image */}
              <Image
                source={{ uri: "/frustrated_patient.jpg" }}
                style={[lp.problemImage, { opacity: 0.3, position: 'absolute' }]}
                resizeMode="cover"
              />

              {/* Overlaying clean UI */}
              <View style={lp.cleanUiCard}>
                <Activity size={24} color={C.em400} style={{ marginBottom: 10 }} />
                <Text style={{ color: C.white, fontFamily: 'Orbitron', fontSize: 16, marginBottom: 5 }}>Vitals Synced</Text>
                <View style={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <View style={{ height: '100%', width: '100%', backgroundColor: C.em400, borderRadius: 2 }}></View>
                </View>
              </View>
            </View>
          </View>

          {/* Right: text */}
          <View style={lp.problemTextCol}>
            <Text style={lp.sectionLabel}>The Problem</Text>
            <Text style={lp.problemTitleText}>{t.problemTitle}</Text>
            <Text style={lp.sectionParagraph}>{t.problemSub}</Text>
            <View style={lp.problemGrid}>
              {[
                "Lost Physical Records",
                "Fragmented Health Data",
                "Slow Emergency Response",
                "Unclear Treatments",
              ].map((item) => (
                <ProblemItem key={item} text={item} />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── How It Works (Process) ─────────────────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: C.dark }]}>
        <Text style={[lp.sectionLabel, { textAlign: "center", color: C.em400 }]}>Process</Text>
        <Text style={[lp.sectionTitle, { textAlign: "center", marginBottom: 60, color: C.white, fontFamily: 'Orbitron, sans-serif' }]}>{t.howItWorksTitle}</Text>

        {/* Vertical Flow Container */}
        <View style={lp.verticalFlowContainer}>
          {Platform.OS === 'web' && (
            <View style={lp.dashedLineContainer}>
              <div style={floatingStyles.verticalDashedLine}></div>
            </View>
          )}

          <StepCard
            num="1"
            icon={<Upload size={28} color={C.dark} />}
            title={t.step1Title}
            desc={t.step1Desc}
            align="left"
          />
          <StepCard
            num="2"
            icon={<BrainCircuit size={28} color={C.dark} />}
            title={t.step2Title}
            desc={t.step2Desc}
            align="right"
          />
          <StepCard
            num="3"
            icon={<Lock size={28} color={C.dark} />}
            title={t.step3Title}
            desc={t.step3Desc}
            align="left"
          />
          <StepCard
            num="4"
            icon={<Smartphone size={28} color={C.dark} />}
            title={t.step4Title}
            desc={t.step4Desc}
            align="right"
          />
        </View>
      </View>


      {/* ── Core Features ────────────────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: "#064e3b", position: 'relative', overflow: 'hidden' }]}>
        {/* Subtle DNA helix pattern background */}
        {Platform.OS === 'web' && (
          <div style={{ ...floatingStyles.dnaBackground, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cpath d=\\"M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM27.5 54.627l.83.83-1.66 1.66-.83-.83.83-.83zM27.5 0l.83.83-1.66 1.66-.83-.83.83-.83M54.627 27.5l.83.83-1.66 1.66-.83-.83.83-.83zM0 27.5l.83.83-1.66 1.66-.83-.83.83-.83zM0 54.627l.83.83-1.66 1.66-.83-.83.83-.83z\\" fill=\\"%232DD4BF\\" fill-opacity=\\"0.05\\" fill-rule=\\"evenodd\\"/%3E%3C/svg%3E")' }}></div>
        )}

        <Text style={[lp.sectionLabel, { color: C.em400, textAlign: "center" }]}>Features</Text>
        <Text style={[lp.sectionTitle, { color: C.white, marginBottom: 48, textAlign: "center", fontFamily: 'Orbitron, sans-serif' }]}>
          Everything You Need
        </Text>
        <View style={lp.featGrid}>
          {[
            {
              icon: <BrainCircuit size={40} color={C.em400} />,
              title: t.scanTitle,
              desc: t.scanDesc,
            },
            {
              icon: <Volume2 size={40} color={C.em400} />,
              title: t.audioTitle,
              desc: t.audioDesc,
            },
            {
              icon: <ShieldCheck size={40} color={C.em400} />,
              title: t.vaultTitle,
              desc: t.vaultDesc,
            },
            {
              icon: <MapPin size={40} color={C.em400} />,
              title: t.nearbyTitle,
              desc: t.nearbyDesc,
            },
            {
              icon: <ActivitySquare size={40} color={C.em400} />,
              title: t.sosTitle,
              desc: t.sosDesc,
            },
            {
              icon: <TestTube size={40} color={C.em400} />,
              title: "Mobile First",
              desc: "Access records anywhere, anytime on any device.",
            },
          ].map(({ icon, title, desc }) => (
            <FeatureBox key={title} icon={icon} title={title} desc={desc} />
          ))}
        </View>
      </View>

      {/* ── Security ─────────────────────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: C.dark }]}>
        <View style={lp.twoColRow}>
          {/* Left: Holographic Shield Visualization */}
          <View style={lp.secShieldPanel}>
            <View style={lp.holographicShieldContainer}>
              <ShieldCheck size={80} color={C.em400} />
              {Platform.OS === 'web' && (
                <>
                  <div style={floatingStyles.holographicRings}></div>
                  <div style={floatingStyles.dataStreamLines}></div>
                  <div style={floatingStyles.lockPulse}></div>
                </>
              )}
            </View>
          </View>
          {/* Right: text */}
          <View style={lp.twoColText}>
            <Text style={[lp.sectionLabel, { color: C.em400 }]}>Security</Text>
            <Text style={[lp.sectionTitle, { color: C.white, fontFamily: 'Orbitron, sans-serif' }]}>{t.securityTitle}</Text>
            <Text style={[lp.sectionParagraph, { color: C.s400 }]}>{t.securityDesc}</Text>
            <View style={{ gap: 16 }}>
              <View style={lp.secPoint}>
                <CheckCircle2 size={20} color={C.em400} />
                <Text style={lp.secPointText}>AES-256 Encryption</Text>
              </View>
              <View style={lp.secPoint}>
                <CheckCircle2 size={20} color={C.em400} />
                <Text style={lp.secPointText}>HIPAA Compliant Infrastructure</Text>
              </View>
              <View style={lp.secPoint}>
                <CheckCircle2 size={20} color={C.em400} />
                <Text style={lp.secPointText}>Biometric Authentication</Text>
              </View>
              <View style={lp.secPoint}>
                <CheckCircle2 size={20} color={C.em400} />
                <Text style={lp.secPointText}>Zero-Knowledge Architecture</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Dashboard / Interface ─────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: "#0f172a" }]}>
        <View style={lp.twoColRow}>
          {/* Left: text */}
          <View style={lp.twoColText}>
            <Text style={[lp.sectionLabel, { color: C.em400 }]}>Interface</Text>
            <Text style={[lp.sectionTitle, { fontSize: 38, lineHeight: 46, color: C.white, fontFamily: 'Orbitron, sans-serif' }]}>{t.dashboardPreviewTitle}</Text>
            <Text style={[lp.sectionParagraph, { color: C.s400 }]}>{t.dashboardPreviewDesc}</Text>
            <View style={{ gap: 12 }}>
              {[
                { icon: <History size={18} color={C.white} />, text: "View diagnosis history" },
                { icon: <Volume2 size={18} color={C.white} />, text: "Listen to audio explanations" },
                { icon: <Hospital size={18} color={C.white} />, text: "Track hospital visits" },
                { icon: <Pill size={18} color={C.white} />, text: "See medicine breakdown" },
              ].map(({ icon, text }) => (
                <View key={text} style={lp.pillRow} {...(Platform.OS === "web" ? { "data-pill": "true" } : {})}>
                  <View style={lp.pillRowIcon}>{icon}</View>
                  <Text style={lp.pillRowText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Right: image with floating elements */}
          <View style={[lp.twoColImageWrap, { position: 'relative', overflow: 'visible' }]}>
            <Image
              source={{ uri: "/interface.png" }}
              style={[lp.twoColImage, { boxShadow: '0 20px 50px rgba(0,0,0,0.5)', borderRadius: 24 }]}
              resizeMode="cover"
            />
            {/* Split screen comparison effect simulated with a floating glass card */}
            <View style={[lp.glassCard, { position: 'absolute', bottom: -20, right: -20, backgroundColor: 'rgba(20, 184, 166, 0.9)', borderColor: C.em400 }]}>
              <ActivitySquare size={24} color={C.white} />
              <View>
                <Text style={[lp.glassCardValue, { color: C.dark }]}>Live Sync</Text>
                <Text style={[lp.glassCardLabel, { color: 'rgba(15,23,42,0.7)' }]}>Connected</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Emergency Banner ─────────────────────────────────────────── */}
      <View style={lp.emergencyBannerWrap}>
        <View style={lp.emergencyBanner}>
          <View style={lp.emergencyLeft}>
            <Text style={lp.emergencyBannerTitle}>Emergency? Don't Panic. Tap SOS.</Text>
            <Text style={lp.emergencyBannerSub}>Smart PHR will detect your GPS, find the nearest hospital, and prepare emergency details instantly.</Text>
            <TouchableOpacity onPress={onActivateSOS} style={lp.sosRedBlockBtn}>
              <ActivitySquare size={24} color={C.white} />
              <Text style={lp.sosRedBlockBtnText}>Activate SOS Now</Text>
            </TouchableOpacity>
          </View>
          <View style={lp.emergencyRight}>
            <View style={lp.emergencyPulseRing}>
              <View style={lp.emergencyIconBg}>
                <ActivitySquare size={64} color={C.red600} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Vision ───────────────────────────────────────────────────── */}
      <View style={[lp.sectionWrap, { backgroundColor: C.s900 }]}>
        <View style={lp.twoColRow}>
          {/* Left: text + pill rows */}
          <View style={lp.twoColText}>
            <Text style={[lp.sectionLabel, { color: C.em400 }]}>FUTURE</Text>
            <Text style={[lp.sectionTitle, { color: C.white, marginBottom: 16 }]}>Our Vision</Text>
            <Text style={[lp.sectionParagraph, { color: C.s400, marginBottom: 28 }]}>
              Smart PHR aims to become a complete digital health ecosystem with advanced integrations.
            </Text>
            <View style={{ gap: 12 }}>
              {[
                { icon: <BrainCircuit size={18} color={C.em400} />, text: "AI Health Assistant" },
                { icon: <Users size={18} color={C.em400} />, text: "Doctor sharing access" },
                { icon: <TrendingUp size={18} color={C.em400} />, text: "Health timeline analytics" },
                { icon: <Activity size={18} color={C.em400} />, text: "Wearable device integration" },
              ].map(({ icon, text }) => (
                <View key={text} style={lp.visionPillRow}>
                  <View style={lp.visionPillRowIcon}>{icon}</View>
                  <Text style={lp.visionPillRowText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Right: large square graphic panel */}
          <View style={lp.visionGraphPanel}>
            <TrendingUp size={120} color={C.em400} strokeWidth={2} />
          </View>
        </View>
      </View>


      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <View style={lp.ctaWrap}>
        <Text style={lp.ctaTitle}>{t.finalCtaTitle}</Text>
        <Text style={lp.ctaSub}>{t.finalCtaSub}</Text>
        <View style={lp.ctaButtons}>
          <TouchableOpacity onPress={onGetStarted} style={lp.ctaPrimaryBtn}>
            <Text style={lp.ctaPrimaryBtnText}>Create Free Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onActivateSOS} style={lp.ctaSosBtn}>
            <Text style={lp.ctaPrimaryBtnText}>{t.tryEmergencyDemo}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <View style={lp.footer}>
        <View style={lp.footerBrand}>
          <HeartPulse size={32} color={C.em400} />
          <Text style={lp.footerBrandName}>SMART PHR</Text>
        </View>
        <Text style={lp.footerCopy}>
          © 2024 Smart PHR. Designed for Campus Excellence.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// CSS styles for web-only floating environment
const floatingStyles = Platform.OS === 'web' ? {
  floatingOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 60%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'pulse 6s infinite alternate'
  },
  floatingOrb2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-20%',
    width: 700,
    height: 700,
    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'pulse 8s infinite alternate-reverse'
  },
  floatIcon1: { position: 'absolute', top: '15%', left: '10%', opacity: 0.4, animation: 'bounce-slow 4s infinite' },
  floatIcon2: { position: 'absolute', top: '25%', right: '5%', opacity: 0.3, animation: 'bounce-slow 5s infinite 1s' },
  floatIcon3: { position: 'absolute', bottom: '30%', left: '5%', opacity: 0.2, animation: 'bounce-slow 6s infinite 2s' },
  floatIcon4: { position: 'absolute', bottom: '15%', right: '15%', opacity: 0.3, animation: 'bounce-slow 7s infinite 0.5s' },
  problemTexture: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2, zIndex: 0
  },
  chaosPaper1: {
    position: 'absolute', width: 220, height: 280, backgroundColor: '#fdfbf7', borderRadius: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transform: 'rotate(-15deg)', top: 20, left: 40, opacity: 0.2
  },
  chaosPaper2: {
    position: 'absolute', width: 200, height: 260, backgroundColor: '#f5f5f5', borderRadius: 4,
    boxShadow: '0 4px 15px rgba(0,0,0,0.6)', transform: 'rotate(25deg)', top: 60, right: 40, opacity: 0.15
  },
  chaosPaper3: {
    position: 'absolute', width: 240, height: 300, backgroundColor: '#faf9f6', borderRadius: 4,
    boxShadow: '0 6px 20px rgba(0,0,0,0.7)', transform: 'rotate(5deg)', bottom: 20, left: 60, opacity: 0.3
  },
  digitalDissolve: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to right, transparent, rgba(15,23,42,0.9) 60%, rgba(15,23,42,1))', zIndex: 1
  }
} : {};

function Badge({ icon, text }) {
  return (
    <View style={lp.badge}>
      {icon}
      <Text style={lp.badgeText}>{text}</Text>
    </View>
  );
}

function ProblemItem({ text }) {
  return (
    <View style={lp.problemItem}>
      <View style={lp.problemIcon}>
        <ShieldAlert size={14} color={C.red600} />
      </View>
      <Text style={lp.problemText}>{text}</Text>
    </View>
  );
}

function StepCard({ num, icon, title, desc, align = "left" }) {
  const [hovered, setHovered] = useState(false);

  // Decide alignment styling
  const isLeft = align === 'left';

  return (
    <View style={[lp.stepRow, isLeft ? lp.stepRowLeft : lp.stepRowRight]}>
      <View
        style={[
          lp.stepCard,
          hovered && lp.stepCardHovered,
          { zIndex: 2 }
        ]}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <View style={lp.stepCardTop}>
          <View style={[lp.stepIcon, hovered && lp.stepIconHovered]}>
            {hovered
              ? (() => {
                const icons = [Upload, BrainCircuit, Lock, Smartphone];
                const Icon = icons[num - 1];
                return <Icon size={28} color="#fff" />;
              })()
              : icon}
          </View>
          <Text style={lp.stepNum}>0{num}</Text>
        </View>
        <Text style={lp.stepTitle}>{num}. {title}</Text>
        <Text style={lp.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function FeatureBox({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <View
      style={[lp.featBox, hovered && lp.featBoxHovered]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <View style={[lp.featBoxIcon, hovered && lp.featBoxIconHovered]}>{
        hovered && icon.props.color === C.em400
          ? cloneElement(icon, { color: C.white })
          : icon
      }</View>
      <Text style={lp.featBoxTitle}>{title}</Text>
      <Text style={lp.featBoxDesc}>{desc}</Text>
    </View>
  );
}

function Section({ label, title, bg = C.white, children }) {
  return (
    <View style={[lp.sectionWrap, bg ? { backgroundColor: bg } : null]}>
      <Text style={lp.sectionLabel}>{label}</Text>
      <Text style={lp.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const lp = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.dark,
    ...(Platform.OS === "web" && {
      background: C.darkBg,
    }),
  },

  // Nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    position: Platform.OS === "web" ? "fixed" : "absolute",
    width: "100%",
    top: 0,
    zIndex: 50,
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }),
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandName: {
    fontSize: 24,
    fontWeight: "900",
    color: C.white,
    letterSpacing: 2,
    fontFamily: "Orbitron, sans-serif",
  },
  navRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  signInBtn: {
    backgroundColor: C.em600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: C.em600,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  signInBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.dark,
    fontFamily: "Inter, sans-serif",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Hero
  hero: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: Platform.OS === "web" ? "100vh" : 800,
    backgroundColor: "transparent",
    position: "relative",
    ...(Platform.OS === "web" && {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
  },
  heroInner: {
    maxWidth: 1300,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 60,
    zIndex: 10,
    ...(Platform.OS === "web" && {
      animation: "heroEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    }),
  },
  heroLeft: {
    flex: 1.2,
    minWidth: 320,
  },
  heroRight: {
    flex: 1,
    minWidth: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 500,
  },
  floatingCapsuleContainer: {
    position: "relative",
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  model3DWrapper: {
    zIndex: 2,
    ...(Platform.OS === "web" && {
      animation: "bounce-slow 4s infinite ease-in-out",
      filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
    }),
  },
  capsuleMain: {
    transform: [{ rotate: "45deg" }],
  },
  modelGlow: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: C.em400,
    borderRadius: 125,
    filter: "blur(80px)",
    opacity: 0.4,
    zIndex: 1,
    ...(Platform.OS === "web" && {
      animation: "pulse 3s infinite",
    }),
  },
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 16,
    zIndex: 3,
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(12px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    }),
  },
  glassCardValue: {
    fontSize: 18,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Orbitron, sans-serif",
  },
  glassCardLabel: {
    fontSize: 10,
    color: C.s400,
    fontFamily: "Inter, sans-serif",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.em400,
    letterSpacing: 1.5,
    fontFamily: "Inter, sans-serif",
  },
  heroTitle: {
    fontSize: clamp(56, '8vw', 96),
    lineHeight: clamp(60, '8.5vw', 100),
    fontWeight: "900",
    color: C.white,
    letterSpacing: 4,
    marginBottom: 16,
    fontFamily: "Orbitron, sans-serif",
    textShadowColor: "rgba(20, 184, 166, 0.4)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  heroTag: {
    fontSize: clamp(24, '3vw', 36),
    color: C.s200,
    fontWeight: "600",
    marginBottom: 16,
    fontFamily: "Inter, sans-serif",
    letterSpacing: 1,
  },
  heroDesc: {
    fontSize: 16,
    color: C.s400,
    lineHeight: 26,
    maxWidth: "90%",
    marginBottom: 40,
    fontFamily: "Inter, sans-serif",
  },
  heroButtons: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 0,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.em600,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: C.em600,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    ...(Platform.OS === "web" && {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
    }),
  },
  sosHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: C.red600,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: C.red600,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    ...(Platform.OS === "web" && {
      transition: "all 0.3s ease",
      cursor: "pointer",
    }),
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Orbitron, sans-serif",
  },
  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
    zIndex: 3,
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(16px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    }),
  },
  aiCardIcon: { backgroundColor: "rgba(20, 184, 166, 0.2)", padding: 14, borderRadius: 16 },
  aiCardLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: C.em400,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
    marginBottom: 4,
  },
  aiCardValue: {
    fontSize: 16,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Orbitron, sans-serif",
  },

  // Sections
  sectionWrap: { paddingVertical: 140, paddingHorizontal: 48 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: C.em600,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "Inter, sans-serif",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: C.s900,
    letterSpacing: -0.5,
    marginBottom: 20,
    fontFamily: "Inter, sans-serif",
  },
  sectionParagraph: {
    fontSize: 15,
    color: C.s500,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 20,
    fontFamily: "Inter, sans-serif",
  },

  // Problem
  problemTwoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 60,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    zIndex: 2,
  },
  problemTitleText: {
    fontSize: clamp(32, '4vw', 48),
    fontWeight: "900",
    color: C.white,
    letterSpacing: -1,
    marginBottom: 20,
    fontFamily: "Orbitron, sans-serif",
  },
  problemTextCol: {
    flex: 1,
    minWidth: 320,
  },
  problemImageCol: {
    flex: 1,
    minWidth: 320,
    height: 400,
  },
  chaosContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cleanUiCard: {
    position: "absolute",
    right: 30,
    bottom: 40,
    zIndex: 3,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.3)",
    width: 220,
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(12px)",
      boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
    }),
  },
  problemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  problemGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  problemItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "47%",
    marginBottom: 4,
  },
  problemIcon: { backgroundColor: "#fee2e2", padding: 4, borderRadius: 999 },
  problemText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.s600,
    fontFamily: "Inter, sans-serif",
  },

  // Steps
  verticalFlowContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingVertical: 20,
    gap: 40,
  },
  dashedLineContainer: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: '50%',
    width: 4,
    zIndex: 0,
  },
  stepRow: {
    width: '100%',
    flexDirection: 'row',
  },
  stepRowLeft: {
    justifyContent: 'flex-start',
    paddingRight: '52%',
  },
  stepRowRight: {
    justifyContent: 'flex-end',
    paddingLeft: '52%',
  },
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  stepCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(12px)",
      transition: "transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease",
    }),
  },
  stepCardHovered: {
    backgroundColor: C.em600,
    borderColor: C.em400,
    ...(Platform.OS === "web" && {
      transform: [{ translateY: -4 }],
    }),
  },
  stepCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  stepIcon: {
    backgroundColor: C.em400,
    padding: 16,
    borderRadius: 16,
    ...(Platform.OS === "web" && {
      transition: "background-color 0.25s ease",
    }),
  },
  stepIconHovered: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  stepNum: {
    fontSize: 48,
    fontWeight: "900",
    color: "rgba(255,255,255,0.1)",
    fontFamily: "Orbitron, sans-serif",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.white,
    marginBottom: 12,
    fontFamily: "Inter, sans-serif",
  },
  stepDesc: {
    fontSize: 15,
    color: C.s400,
    lineHeight: 24,
    fontFamily: "Inter, sans-serif",
  },

  // Features
  featGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center",
    zIndex: 2,
  },
  featBox: {
    width: Platform.OS === "web" ? "calc(33.333% - 16px)" : "100%",
    minWidth: 280,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...(Platform.OS === "web" && {
      backdropFilter: "blur(16px)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    }),
  },
  featBoxHovered: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderColor: C.em400,
  },
  featBoxIcon: {
    marginBottom: 24,
  },
  featBoxIconHovered: {},
  featBoxTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.white,
    marginBottom: 12,
    fontFamily: "Orbitron, sans-serif",
  },
  featBoxDesc: {
    fontSize: 15,
    color: C.s200,
    lineHeight: 24,
    fontFamily: "Inter, sans-serif",
  },

  // Security shield decorative panel
  secShieldPanel: {
    flex: 1,
    minWidth: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  holographicShieldContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  secPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  secPointText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Dashboard features (pillRow)
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 18,
    width: '100%',
  },
  pillRowIcon: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 10
  },
  pillRowText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Emergency banner
  emergencyBannerWrap: { paddingHorizontal: 24, paddingVertical: 48, backgroundColor: C.dark },
  emergencyBanner: {
    backgroundColor: C.dark,
    borderWidth: 1,
    borderColor: C.red600,
    borderRadius: 32,
    padding: 48,
    shadowColor: C.red600,
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyLeft: {
    flex: 1,
    minWidth: 300,
    zIndex: 2,
  },
  emergencyRight: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emergencyBannerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 16,
    fontFamily: "Orbitron, sans-serif",
  },
  emergencyBannerSub: {
    fontSize: 16,
    color: C.s400,
    lineHeight: 26,
    marginBottom: 32,
    fontFamily: "Inter, sans-serif",
  },
  sosRedBlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.red600,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: C.red600,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  sosRedBlockBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Orbitron, sans-serif",
    textTransform: 'uppercase',
  },
  emergencyPulseRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === "web" && {
      animation: "pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)",
    }),
  },
  emergencyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shared two-column layout
  twoColRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 48,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  twoColText: {
    flex: 1,
    minWidth: 280,
  },
  twoColImageWrap: {
    flex: 1,
    minWidth: 280,
    borderRadius: 28,
  },
  twoColImage: {
    width: "100%",
    height: 380,
    borderRadius: 28,
  },

  // Security shield decorative panel
  secShieldPanel: {
    flex: 1,
    minWidth: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  holographicShieldContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  secPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  secPointText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Dashboard features (pillRow)
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 18,
    width: '100%',
  },
  pillRowIcon: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 10,
  },
  pillRowText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Emergency banner
  emergencyBannerWrap: { paddingHorizontal: 24, paddingVertical: 48, backgroundColor: C.dark },
  emergencyBanner: {
    backgroundColor: C.dark,
    borderWidth: 1,
    borderColor: C.red600,
    borderRadius: 32,
    padding: 48,
    shadowColor: C.red600,
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyLeft: {
    flex: 1,
    minWidth: 300,
    zIndex: 2,
  },
  emergencyRight: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emergencyBannerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 16,
    fontFamily: "Orbitron, sans-serif",
  },
  emergencyBannerSub: {
    fontSize: 16,
    color: C.s400,
    lineHeight: 26,
    marginBottom: 32,
    fontFamily: "Inter, sans-serif",
  },
  sosRedBlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.red600,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: C.red600,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  sosRedBlockBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Orbitron, sans-serif",
    textTransform: 'uppercase',
  },
  emergencyPulseRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === "web" && {
      animation: "pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)",
    }),
  },
  emergencyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Emergency 2x2 chips
  emergencyChipGrid: {
    flex: 1,
    minWidth: 280,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  emergencyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: "47%",
  },
  emergencyChipIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 10,
    borderRadius: 12,
  },
  emergencyChipText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Vision
  visionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 18,
    flex: 1,
    minWidth: 180,
  },
  visionText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  visionPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  visionPillRowIcon: {
    backgroundColor: "rgba(52,211,153,0.12)",
    padding: 10,
    borderRadius: 999,
  },
  visionPillRowText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  visionGraphPanel: {
    flex: 1,
    minWidth: 320,
    minHeight: 280,
    height: "100%",
    backgroundColor: "rgba(4,120,87,0.15)",
    borderWidth: 1,
    borderColor: "rgba(4,120,87,0.3)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  // CTA
  ctaWrap: { alignItems: "center", padding: 40, backgroundColor: C.em50 },
  ctaTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: C.s900,
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Inter, sans-serif",
  },
  ctaSub: {
    fontSize: 14,
    fontWeight: "700",
    color: C.s400,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter, sans-serif",
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimaryBtn: {
    backgroundColor: C.em600,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaSosBtn: {
    backgroundColor: C.red600,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: C.red600,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaPrimaryBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  // Footer
  footer: {
    backgroundColor: C.s900,
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  footerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  footerBrandName: {
    fontSize: 26,
    fontWeight: "900",
    color: C.em400,
    letterSpacing: -0.5,
    fontFamily: "Inter, sans-serif",
  },
  footerCopy: {
    fontSize: 13,
    color: C.s500,
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  },
});
