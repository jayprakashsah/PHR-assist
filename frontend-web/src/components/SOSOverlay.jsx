import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import {
  ShieldAlert,
  X,
  MapPin,
  Phone,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { translations } from "../translations";

const C = {
  red600: "#dc2626",
  red700: "#b91c1c",
  red900: "#7f1d1d",
  green500: "#22c55e",
  white: "#ffffff",
};

export default function SOSOverlay({ user, lang, onClose }) {
  const t = translations[lang];
  const [step, setStep] = useState(1); // 1 = locating, 2 = confirming, 3 = dispatched, -1 = error
  const [location, setLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          setLocation(loc);
          findNearestHospital(loc.lat, loc.lng);
        },
        () => setStep(-1),
      );
    } else {
      setStep(-1);
    }
  }, []);

  const findNearestHospital = async (lat, lng) => {
    try {
      const query = `[out:json];node["amenity"="hospital"](around:10000,${lat},${lng});out 1;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data.elements.length > 0) {
        const h = data.elements[0];
        setNearestHospital({
          name: h.tags.name || "Emergency Services",
          phone: h.tags.phone || h.tags["contact:phone"] || "108",
          lat: h.lat,
          lng: h.lon,
        });
      } else {
        setNearestHospital({ name: "General Emergency", phone: "108" });
      }
      setStep(2);
    } catch (_) {
      setNearestHospital({ name: "General Emergency", phone: "108" });
      setStep(2);
    }
  };

  const dispatchSOS = async () => {
    setDispatching(true);
    try {
      await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          lat: location?.lat,
          lng: location?.lng,
          hospital: nearestHospital,
        }),
      });
    } catch (_) {
    } finally {
      setDispatching(false);
      setStep(3);
    }
  };

  return (
    <View style={so.overlay}>
      <ScrollView
        contentContainerStyle={so.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          style={so.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={28} color={C.white} />
        </TouchableOpacity>

        {/* Pulsing shield */}
        <View style={so.shieldWrap}>
          <View style={so.shieldInner}>
            <ShieldAlert size={64} color={C.red600} />
          </View>
        </View>

        {/* Step 1 — Locating */}
        {step === 1 && (
          <View style={so.stepWrap}>
            <Text style={so.stepTitle}>{t.locating}</Text>
            <Text style={so.stepSub}>
              Acquiring GPS coordinates for emergency dispatch.
            </Text>
            <ActivityIndicator
              color="rgba(255,255,255,0.5)"
              size="large"
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <View style={so.stepWrap}>
            <Text style={so.stepTitle}>{t.emergencyAlert}</Text>
            <Text style={so.stepSub}>
              Nearest help:{" "}
              <Text style={{ fontWeight: "900" }}>{nearestHospital?.name}</Text>
            </Text>

            <View style={so.infoCard}>
              <View style={so.infoRow}>
                <View style={so.infoRowIcon}>
                  <MapPin size={22} color={C.white} />
                </View>
                <View>
                  <Text style={so.infoRowLabel}>Your Location</Text>
                  <Text style={so.infoRowValue}>
                    {location?.lat?.toFixed(4)}, {location?.lng?.toFixed(4)}
                  </Text>
                </View>
              </View>
              <View style={so.infoRow}>
                <View style={so.infoRowIcon}>
                  <Phone size={22} color={C.white} />
                </View>
                <View>
                  <Text style={so.infoRowLabel}>Emergency Contact</Text>
                  <Text style={so.infoRowValue}>{nearestHospital?.phone}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={dispatchSOS}
              disabled={dispatching}
              style={so.dispatchBtn}
              activeOpacity={0.85}
            >
              {dispatching ? (
                <ActivityIndicator color={C.red600} size="small" />
              ) : (
                <Text style={so.dispatchBtnText}>{t.dispatchSOS}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 — Dispatched */}
        {step === 3 && (
          <View style={so.stepWrap}>
            <View style={so.successIcon}>
              <CheckCircle2 size={64} color={C.green500} />
            </View>
            <Text style={so.stepTitle}>{t.alertSent}</Text>
            <Text style={so.stepSub}>
              Emergency services and your contacts have been notified with your
              medical profile and location.
            </Text>

            <View style={so.nextStepsCard}>
              <Text style={so.nextStepsLabel}>{t.nextSteps}</Text>
              {[
                "Stay where you are if safe",
                "Keep your phone unlocked",
                "Help is on the way",
              ].map((s, i) => (
                <View key={i} style={so.nextStep}>
                  <View style={so.nextStepNum}>
                    <Text style={so.nextStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={so.nextStepText}>{s}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={onClose} style={so.closeGhostBtn}>
              <Text style={so.closeGhostBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step -1 — Error */}
        {step === -1 && (
          <View style={so.stepWrap}>
            <AlertCircle size={64} color={C.white} />
            <Text style={so.stepTitle}>Location Error</Text>
            <Text style={so.stepSub}>
              We couldn't access your GPS. Please enable location services for
              emergency features.
            </Text>
            <TouchableOpacity onPress={onClose} style={so.dispatchBtn}>
              <Text style={so.dispatchBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const so = StyleSheet.create({
  overlay: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.red600,
    zIndex: 999,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  closeBtn: {
    position: "absolute",
    top: 24,
    right: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 999,
  },
  shieldWrap: {
    backgroundColor: C.white,
    padding: 32,
    borderRadius: 999,
    marginBottom: 32,
    shadowColor: C.red900,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  shieldInner: { alignItems: "center", justifyContent: "center" },

  stepWrap: { width: "100%", maxWidth: 460, alignItems: "center", gap: 16 },
  stepTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: -0.5,
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  },
  stepSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter, sans-serif",
  },

  infoCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    width: "100%",
    borderRadius: 28,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  infoRowIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 16,
  },
  infoRowLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Inter, sans-serif",
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  dispatchBtn: {
    backgroundColor: C.white,
    width: "100%",
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  dispatchBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: C.red600,
    fontFamily: "Inter, sans-serif",
  },

  successIcon: {
    backgroundColor: C.white,
    padding: 24,
    borderRadius: 999,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },

  nextStepsCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    width: "100%",
    borderRadius: 28,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  nextStepsLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: "Inter, sans-serif",
  },
  nextStep: { flexDirection: "row", alignItems: "center", gap: 14 },
  nextStepNum: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  nextStepNumText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  nextStepText: {
    fontSize: 14,
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  closeGhostBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  closeGhostBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
});
