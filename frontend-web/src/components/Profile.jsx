import { useState, useEffect } from "react";
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
  User,
  Droplets,
  ShieldAlert,
  Phone,
  Save,
  CheckCircle2,
  LogOut,
  Heart,
  Contact,
  MapPin,
} from "lucide-react";
import { translations } from "../translations";

const C = {
  em600: "#059669",
  em700: "#047857",
  em50: "#ecfdf5",
  em100: "#d1fae5",
  em900: "#064e3b",
  s50: "#f8fafc",
  s100: "#f1f5f9",
  s200: "#e2e8f0",
  s400: "#94a3b8",
  s500: "#64748b",
  s900: "#0f172a",
  red50: "#fef2f2",
  red100: "#fee2e2",
  red600: "#dc2626",
  amber500: "#f59e0b",
  blue500: "#3b82f6",
  white: "#ffffff",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile({ user, lang, onLogout }) {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: "",
    allergies: "",
    emergency_contact: "",
    address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          blood_group: data.blood_group || "",
          allergies: data.allergies || "",
          emergency_contact: data.emergency_contact || "",
          address: data.address || "",
        });
      }
    } catch (_) { }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (val) => setFormData({ ...formData, [key]: val });

  return (
    <ScrollView style={pr.page} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={pr.pageHeader}>
        <View style={pr.avatar}>
          <Text style={pr.avatarText}>{(user?.name || "U")[0]}</Text>
        </View>
        <View>
          <Text style={pr.pageTitle}>{t.profileTitle}</Text>
          <Text style={pr.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Profile card */}
      <View style={pr.card}>
        {/* Dark header inside card */}
        <View style={pr.cardHeader}>
          <View style={pr.cardHeaderAvatar}>
            <Text style={pr.cardHeaderAvatarText}>
              {(user?.name || "U")[0]}
            </Text>
          </View>
          <View>
            <Text style={pr.cardHeaderName}>{user?.name}</Text>
            <Text style={pr.cardHeaderEmail}>{user?.email}</Text>
          </View>
          <Heart
            size={80}
            color="rgba(255,255,255,0.05)"
            style={pr.cardHeaderBg}
          />
        </View>

        {/* Form */}
        <View style={pr.form}>
          {/* Blood group */}
          <View style={pr.fieldGroup}>
            <View style={pr.fieldLabel}>
              <Droplets size={16} color={C.red600} />
              <Text style={pr.fieldLabelText}>{t.bloodGroup}</Text>
            </View>
            <View style={pr.bloodGroupGrid}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => update("blood_group")(bg)}
                  style={[
                    pr.bloodChip,
                    formData.blood_group === bg && pr.bloodChipActive,
                  ]}
                >
                  <Text
                    style={[
                      pr.bloodChipText,
                      formData.blood_group === bg && pr.bloodChipTextActive,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emergency contact */}
          <View style={pr.fieldGroup}>
            <View style={pr.fieldLabel}>
              <Contact size={16} color={C.em600} />
              <Text style={pr.fieldLabelText}>{t.emergencyContact}</Text>
            </View>
            <View style={pr.inputWrap}>
              <Phone size={18} color={C.s400} />
              <TextInput
                style={pr.inputField}
                placeholder="+91 98765 43210"
                placeholderTextColor={C.s400}
                value={formData.emergency_contact}
                onChangeText={update("emergency_contact")}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address */}
          <View style={pr.fieldGroup}>
            <View style={pr.fieldLabel}>
              <MapPin size={16} color={C.blue500} />
              <Text style={pr.fieldLabelText}>{t.address}</Text>
            </View>
            <TextInput
              style={pr.textArea}
              placeholder="Enter your full residential address..."
              placeholderTextColor={C.s400}
              value={formData.address}
              onChangeText={update("address")}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Allergies */}
          <View style={pr.fieldGroup}>
            <View style={pr.fieldLabel}>
              <ShieldAlert size={16} color={C.amber500} />
              <Text style={pr.fieldLabelText}>{t.allergies}</Text>
            </View>
            <TextInput
              style={[pr.textArea, { minHeight: 100 }]}
              placeholder="List any allergies, chronic conditions, or regular medications..."
              placeholderTextColor={C.s400}
              value={formData.allergies}
              onChangeText={update("allergies")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[pr.saveBtn, loading && pr.saveBtnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : saved ? (
              <>
                <CheckCircle2 size={22} color="#fff" />
                <Text style={pr.saveBtnText}>Profile Updated!</Text>
              </>
            ) : (
              <>
                <Save size={22} color="#fff" />
                <Text style={pr.saveBtnText}>{t.saveProfile}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Info banner */}
      <View style={pr.infoBanner}>
        <View style={pr.infoBannerIcon}>
          <Heart size={24} color={C.em600} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pr.infoBannerTitle}>Why complete your profile?</Text>
          <Text style={pr.infoBannerText}>
            Your medical info is shared with emergency responders during an SOS
            alert, potentially saving critical time.
          </Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={onLogout} style={pr.logoutBtn}>
        <LogOut size={22} color={C.red600} />
        <Text style={pr.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const pr = StyleSheet.create({
  page: { flex: 1 },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: C.em600,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  userEmail: {
    fontSize: 14,
    color: C.s500,
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },

  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.s200,
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 20,
  },
  cardHeader: {
    backgroundColor: C.s900,
    padding: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    position: "relative",
    overflow: "hidden",
  },
  cardHeaderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: C.em600,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeaderAvatarText: {
    fontSize: 26,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  cardHeaderName: {
    fontSize: 22,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  cardHeaderEmail: {
    fontSize: 13,
    color: C.s400,
    fontFamily: "Inter, sans-serif",
  },
  cardHeaderBg: { position: "absolute", bottom: -20, right: -20 },

  form: { padding: 24, gap: 24 },
  fieldGroup: { gap: 12 },
  fieldLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.s900,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
  },

  bloodGroupGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bloodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.s50,
    borderWidth: 1,
    borderColor: C.s200,
  },
  bloodChipActive: { backgroundColor: C.em600, borderColor: C.em600 },
  bloodChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.s600,
    fontFamily: "Inter, sans-serif",
  },
  bloodChipTextActive: { color: C.white },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.s50,
    borderWidth: 1,
    borderColor: C.s100,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  textArea: {
    backgroundColor: C.s50,
    borderWidth: 1,
    borderColor: C.s100,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.s900,
    minHeight: 80,
    fontFamily: "Inter, sans-serif",
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.em600,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: C.em50,
    borderWidth: 1,
    borderColor: C.em100,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  infoBannerIcon: {
    backgroundColor: C.white,
    padding: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.em900,
    marginBottom: 4,
    fontFamily: "Inter, sans-serif",
  },
  infoBannerText: {
    fontSize: 13,
    color: "rgba(6,78,59,0.75)",
    fontWeight: "500",
    lineHeight: 20,
    fontFamily: "Inter, sans-serif",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.red50,
    borderWidth: 1,
    borderColor: C.red100,
    paddingVertical: 20,
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "900",
    color: C.red600,
    fontFamily: "Inter, sans-serif",
  },
});
