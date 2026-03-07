import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  LogIn,
  UserPlus,
  HeartPulse,
  ArrowLeft,
  Languages,
} from "lucide-react";
import { translations } from "../translations";

const C = {
  em600: "#059669",
  em700: "#047857",
  em50: "#ecfdf5",
  em100: "#d1fae5",
  s50: "#f8fafc",
  s100: "#f1f5f9",
  s200: "#e2e8f0",
  s400: "#94a3b8",
  s500: "#64748b",
  s900: "#0f172a",
  red50: "#fef2f2",
  red100: "#fee2e2",
  red500: "#ef4444",
  white: "#ffffff",
};

export default function Auth({ onLogin, lang, toggleLang, onBack }) {
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("smart_phr_user", JSON.stringify(data));
        onLogin(data);
      } else {
        setError(data.error || data.message || "Something went wrong");
      }
    } catch (_) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <ArrowLeft size={20} color={C.em600} />
          <Text style={s.backBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
          <Languages size={16} color={C.em600} />
          <Text style={s.langBtnText}>
            {lang === "en" ? "தமிழ்" : "English"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={s.card}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoIcon}>
            <HeartPulse size={48} color={C.em600} />
          </View>
          <Text style={s.logoName}>{t.appName}</Text>
          <Text style={s.logoTagline}>{t.tagline}</Text>
        </View>

        {/* Toggle */}
        <View style={s.toggle}>
          <TouchableOpacity
            onPress={() => {
              setIsLogin(true);
              setError("");
            }}
            style={[s.toggleBtn, isLogin && s.toggleBtnActive]}
          >
            <Text style={[s.toggleBtnText, isLogin && s.toggleBtnTextActive]}>
              {t.signIn}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsLogin(false);
              setError("");
            }}
            style={[s.toggleBtn, !isLogin && s.toggleBtnActive]}
          >
            <Text style={[s.toggleBtnText, !isLogin && s.toggleBtnTextActive]}>
              {t.signUp}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={s.form}>
          {!isLogin && (
            <View style={s.field}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput
                style={s.input}
                placeholder="John Doe"
                placeholderTextColor={C.s400}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={s.input}
              placeholder="john@example.com"
              placeholderTextColor={C.s400}
              value={formData.email}
              onChangeText={(v) => setFormData({ ...formData, email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>PASSWORD</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={C.s400}
              value={formData.password}
              onChangeText={(v) => setFormData({ ...formData, password: v })}
              secureTextEntry
            />
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                {isLogin ? (
                  <LogIn size={22} color="#fff" />
                ) : (
                  <UserPlus size={22} color="#fff" />
                )}
                <Text style={s.submitBtnText}>
                  {isLogin ? t.signIn : t.signUp}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch link */}
        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          style={s.switchLink}
        >
          <Text style={s.switchLinkText}>
            {isLogin
              ? lang === "en"
                ? "Don't have an account? Sign up"
                : "கணக்கு இல்லையா? பதிவு செய்க"
              : lang === "en"
                ? "Already have an account? Sign in"
                : "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.em50 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 16,
    left: 20,
    right: 20,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.em600,
    fontFamily: "Inter, sans-serif",
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.em600,
    fontFamily: "Inter, sans-serif",
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 40,
    padding: 36,
    shadowColor: C.em600,
    shadowOpacity: 0.08,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },

  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoIcon: {
    backgroundColor: C.em100,
    padding: 20,
    borderRadius: 28,
    marginBottom: 12,
    shadowColor: C.em600,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  logoName: {
    fontSize: 28,
    fontWeight: "900",
    color: C.s900,
    letterSpacing: -0.5,
    fontFamily: "Inter, sans-serif",
  },
  logoTagline: {
    fontSize: 14,
    color: C.s500,
    fontWeight: "500",
    marginTop: 4,
    fontFamily: "Inter, sans-serif",
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: C.s50,
    borderRadius: 18,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: C.em600,
    shadowColor: C.em600,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.s400,
    fontFamily: "Inter, sans-serif",
  },
  toggleBtnTextActive: { color: C.white },

  form: { gap: 18 },
  field: { gap: 6 },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: C.s400,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginLeft: 4,
    fontFamily: "Inter, sans-serif",
  },
  input: {
    backgroundColor: C.s50,
    borderWidth: 1,
    borderColor: C.s200,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  errorBox: {
    backgroundColor: C.red50,
    borderWidth: 1,
    borderColor: C.red100,
    borderRadius: 18,
    padding: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.red500,
    fontFamily: "Inter, sans-serif",
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.em600,
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 8,
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  switchLink: { alignItems: "center", marginTop: 24 },
  switchLinkText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.em600,
    fontFamily: "Inter, sans-serif",
  },
});
