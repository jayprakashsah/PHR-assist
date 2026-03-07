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
  Activity,
  FileText,
  Calendar,
  Hospital,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Volume2,
  Pill,
  Search,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { translations } from "../translations";

const C = {
  em600: "#059669",
  em50: "#ecfdf5",
  em100: "#d1fae5",
  em400: "#34d399",
  s50: "#f8fafc",
  s100: "#f1f5f9",
  s200: "#e2e8f0",
  s400: "#94a3b8",
  s500: "#64748b",
  s900: "#0f172a",
  white: "#ffffff",
};

export default function Dashboard({ user, lang }) {
  const t = translations[lang];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) fetchRecords();
  }, [user?.id]);

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/records/${user.id}`);
      if (res.ok) setRecords(await res.json());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(
    (r) =>
      (r.diagnosis || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.hospital_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScrollView style={ds.page} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={ds.header}>
        <View style={ds.avatar}>
          <Text style={ds.avatarText}>{(user?.name || "U")[0]}</Text>
        </View>
        <View>
          <Text style={ds.greeting}>Hello, {user?.name}</Text>
          <Text style={ds.recordCount}>
            {records.length} health record{records.length !== 1 ? "s" : ""}{" "}
            stored
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={ds.searchWrap}>
        <Search size={20} color={C.s400} style={ds.searchIcon} />
        <TextInput
          style={ds.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={C.s400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Records */}
      {loading ? (
        <View style={ds.loadingWrap}>
          <ActivityIndicator size="large" color={C.em600} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={ds.emptyBox}>
          <View style={ds.emptyIcon}>
            <FileText size={40} color={C.s400} />
          </View>
          <Text style={ds.emptyTitle}>{t.noRecords}</Text>
          <Text style={ds.emptySub}>{t.noRecordsSub}</Text>
        </View>
      ) : (
        <View style={ds.recordList}>
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              lang={lang}
              isExpanded={expandedId === record.id}
              onToggle={() =>
                setExpandedId(expandedId === record.id ? null : record.id)
              }
            />
          ))}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function RecordCard({ record, isExpanded, onToggle, lang }) {
  const t = translations[lang];
  let medicines = [];
  try {
    medicines = JSON.parse(record.medicines || "[]");
  } catch (_) { }

  const playAudio = () => {
    if (record.audio_data) {
      const audio = new window.Audio(
        `data:audio/mp3;base64,${record.audio_data}`,
      );
      audio.play();
    }
  };

  return (
    <View style={rc.card}>
      <TouchableOpacity
        onPress={onToggle}
        style={rc.header}
        activeOpacity={0.7}
      >
        <View style={rc.headerLeft}>
          <View style={rc.iconWrap}>
            <Activity size={22} color={C.em600} />
          </View>
          <View>
            <Text style={rc.diagnosis}>{record.diagnosis}</Text>
            <View style={rc.meta}>
              <Hospital size={13} color={C.s400} />
              <Text style={rc.metaText}>{record.hospital_name}</Text>
              <Calendar size={13} color={C.s400} />
              <Text style={rc.metaText}>{record.visit_date}</Text>
            </View>
          </View>
        </View>
        <View style={rc.headerRight}>
          {record.audio_data && (
            <TouchableOpacity
              onPress={playAudio}
              style={rc.audioBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Volume2 size={18} color={C.em600} />
            </TouchableOpacity>
          )}
          {isExpanded ? (
            <ChevronDown size={22} color={C.s400} />
          ) : (
            <ChevronRight size={22} color={C.s400} />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={rc.expanded}>
          {/* AI Summary */}
          <View style={rc.summaryWrap}>
            <View style={rc.summaryLabel}>
              <View style={rc.summaryLabelIcon}>
                <Sparkles size={14} color={C.em600} />
              </View>
              <Text style={rc.sectionLabelText}>{t.aiSummary}</Text>
            </View>
            <View style={rc.summaryBox}>
              <Text style={rc.summaryText}>"{record.summary}"</Text>
              <View style={rc.summaryBadge}>
                <ClipboardList size={10} color={C.white} />
              </View>
            </View>
          </View>

          {/* Medicines */}
          <View style={rc.medsWrap}>
            <View style={rc.medsLabel}>
              <Pill size={16} color={C.em600} />
              <Text style={rc.sectionLabelText}>{t.prescribedMeds}</Text>
            </View>
            {medicines.map((med, i) => (
              <View key={i} style={rc.medRow}>
                <View style={rc.medLeft}>
                  <View style={rc.medIcon}>
                    <Pill size={18} color={C.s400} />
                  </View>
                  <View>
                    <Text style={rc.medName}>{med.name}</Text>
                    <Text style={rc.medPurpose}>{med.purpose}</Text>
                  </View>
                </View>
                <View style={rc.medDosageBadge}>
                  <Text style={rc.medDosageText}>{med.dosage}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action plan */}
          <View style={rc.actionWrap}>
            <View style={rc.actionLabel}>
              <Stethoscope size={16} color={C.em600} />
              <Text style={rc.sectionLabelText}>{t.actionPlan}</Text>
            </View>
            <View style={rc.actionBox}>
              <Text style={rc.actionText}>{record.action_plan}</Text>
            </View>
          </View>

          <Text style={rc.footerMeta}>
            Doctor: {record.doctor_name} • ID: #{record.id}
          </Text>
        </View>
      )}
    </View>
  );
}

const ds = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.em600,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.em600,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: C.white,
    fontFamily: "Inter, sans-serif",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  recordCount: {
    fontSize: 13,
    color: C.s500,
    fontWeight: "500",
    marginTop: 2,
    fontFamily: "Inter, sans-serif",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.s200,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },

  loadingWrap: { alignItems: "center", paddingVertical: 60 },
  emptyBox: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.s200,
    borderStyle: "dashed",
    borderRadius: 40,
    padding: 48,
    alignItems: "center",
    gap: 10,
  },
  emptyIcon: {
    backgroundColor: C.s50,
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  emptySub: {
    fontSize: 14,
    color: C.s500,
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  },
  recordList: { gap: 14 },
});

const rc = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.s200,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 4,
  },
  header: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  iconWrap: { backgroundColor: C.em50, padding: 12, borderRadius: 18 },
  diagnosis: {
    fontSize: 17,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaText: {
    fontSize: 12,
    color: C.s500,
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioBtn: { backgroundColor: C.em50, padding: 8, borderRadius: 999 },

  expanded: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: C.s100,
    backgroundColor: "rgba(248,250,252,0.5)",
    gap: 24,
  },

  summaryWrap: { gap: 12 },
  summaryLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryLabelIcon: { backgroundColor: C.em100, padding: 6, borderRadius: 10 },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.s900,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
  },
  summaryBox: {
    backgroundColor: C.white,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.s100,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  summaryText: {
    fontSize: 13,
    color: C.s500,
    lineHeight: 20,
    fontStyle: "italic",
    fontFamily: "Inter, sans-serif",
  },
  summaryBadge: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: C.em600,
    padding: 4,
    borderRadius: 8,
  },

  medsWrap: { gap: 10 },
  medsLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  medRow: {
    backgroundColor: C.white,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.s100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  medLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  medIcon: {
    width: 40,
    height: 40,
    backgroundColor: C.s50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  medName: {
    fontSize: 13,
    fontWeight: "900",
    color: C.s900,
    fontFamily: "Inter, sans-serif",
  },
  medPurpose: {
    fontSize: 11,
    color: C.s500,
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },
  medDosageBadge: {
    backgroundColor: C.em50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.em100,
  },
  medDosageText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.em600,
    fontFamily: "Inter, sans-serif",
  },

  actionWrap: { gap: 10 },
  actionLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBox: {
    backgroundColor: C.em600,
    padding: 20,
    borderRadius: 20,
    shadowColor: C.em600,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  actionText: {
    fontSize: 13,
    color: C.white,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Inter, sans-serif",
  },

  footerMeta: {
    fontSize: 10,
    fontWeight: "700",
    color: C.s400,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
  },
});
