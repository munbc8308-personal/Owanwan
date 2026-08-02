import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Lock } from "lucide-react-native";
import { COLOR, SPORT_LABEL } from "@/constants/theme";
import type { Sport } from "@/constants/theme";
import type { Challenge, ChallengeTemplate } from "@/types";
import ChallengeDetailOverlay from "@/components/modals/ChallengeDetailOverlay";
import TemplatePickerOverlay from "@/components/modals/TemplatePickerOverlay";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function formatPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()} (${DAY_NAMES[d.getDay()]})`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

function daysLabel(end: string) {
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  if (diff <= 0) return "종료됨";
  if (diff === 1) return "오늘 마감";
  return `${diff}일 남음`;
}

function mapChallenge(
  row: {
    id: string;
    title: string;
    description: string | null;
    sport: string;
    unit: string;
    goal: number;
    group_goal: boolean;
    rules: unknown;
    period_start: string;
    period_end: string;
    challenge_participants: Array<{
      user_id: string;
      progress: number;
      users: { nickname: string; avatar_color: string } | null;
    }>;
  },
  userId: string
): Challenge {
  return {
    id: row.id,
    title: row.title,
    sport: row.sport as Sport,
    groupGoal: row.group_goal,
    desc: row.description ?? "",
    period: formatPeriod(row.period_start, row.period_end),
    unit: row.unit,
    goal: row.goal,
    days: daysLabel(row.period_end),
    joined: row.challenge_participants.some((p) => p.user_id === userId),
    participants: row.challenge_participants.map((p) => ({
      name: p.users?.nickname ?? "?",
      color: p.users?.avatar_color ?? COLOR.slate,
      progress: p.progress,
    })),
    rules: (row.rules as string[]) ?? [],
  };
}

export default function ChallengeScreen() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [detail, setDetail] = useState<Challenge | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (!data) return null;
    const g = data.groups as { id: string; name: string } | null;
    if (!g) return null;
    setGroupId(g.id);
    setGroupName(g.name);
    return g.id;
  }, [user]);

  const loadChallenges = useCallback(
    async (gid: string) => {
      if (!user) return;
      const { data } = await supabase
        .from("challenges")
        .select(`
          id, title, description, sport, unit, goal, group_goal, rules,
          period_start, period_end,
          challenge_participants (
            user_id, progress,
            users ( nickname, avatar_color )
          )
        `)
        .eq("group_id", gid)
        .gte("period_end", new Date().toISOString())
        .order("period_start", { ascending: false });

      setChallenges((data ?? []).map((row) => mapChallenge(row as Parameters<typeof mapChallenge>[0], user.id)));
    },
    [user]
  );

  const loadTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("challenge_templates")
      .select("*")
      .order("goal");
    setTemplates(
      (data ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        sport: t.sport as Sport,
        groupGoal: t.group_goal,
        desc: t.description ?? "",
        period: `시작하면 ${t.period_days ?? 7}일간 진행돼요`,
        unit: t.unit,
        goal: t.goal,
        rules: (t.rules as string[]) ?? [],
        periodDays: t.period_days ?? 7,
      }))
    );
  }, []);

  const loadAll = useCallback(async () => {
    const gid = await loadGroup();
    if (gid) await loadChallenges(gid);
    await loadTemplates();
    setLoading(false);
  }, [loadGroup, loadChallenges, loadTemplates]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const gid = groupId ?? (await loadGroup());
    if (gid) await loadChallenges(gid);
    setRefreshing(false);
  };

  const handleStartTemplate = useCallback(
    async (t: ChallengeTemplate) => {
      if (!user || !groupId) return;
      const challengeId = generateUUID();
      const periodStart = new Date();
      const periodEnd = new Date(Date.now() + t.periodDays * 86400000);

      const { error: cErr } = await supabase.from("challenges").insert({
        id: challengeId,
        group_id: groupId,
        template_id: t.id,
        is_custom: false,
        title: t.title,
        description: t.desc,
        sport: t.sport,
        unit: t.unit,
        goal: t.goal,
        group_goal: t.groupGoal,
        rules: t.rules,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        created_by: user.id,
      });
      if (cErr) { console.error(cErr); return; }

      await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: user.id,
        progress: 0,
      });

      setTemplatesOpen(false);
      await loadChallenges(groupId);
    },
    [user, groupId, loadChallenges]
  );

  const handleToggleJoin = useCallback(
    async (challenge: Challenge) => {
      if (!user) return;
      if (challenge.joined) {
        await supabase
          .from("challenge_participants")
          .delete()
          .match({ challenge_id: challenge.id, user_id: user.id });
      } else {
        await supabase.from("challenge_participants").insert({
          challenge_id: challenge.id,
          user_id: user.id,
          progress: 0,
        });
      }
      if (groupId) await loadChallenges(groupId);
      // Sync detail view
      setDetail((prev) =>
        prev?.id === challenge.id ? { ...prev, joined: !challenge.joined } : prev
      );
    },
    [user, groupId, loadChallenges]
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLOR.asphalt} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: COLOR.asphalt }}>
          챌린지
        </Text>
        <TouchableOpacity
          onPress={() => setTemplatesOpen(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLOR.asphalt,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={18} color={COLOR.lime} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ gap: 12, paddingBottom: 32, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLOR.asphalt} />
        }
      >
        {challenges.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>
              진행 중인 챌린지가 없어요
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate, marginTop: 4 }}>
              + 버튼으로 새 챌린지를 시작해보세요
            </Text>
          </View>
        )}

        {challenges.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setDetail(c)}
            style={{
              backgroundColor: COLOR.white,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1.5,
              borderColor: COLOR.concreteDark,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: COLOR.concreteDark,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 9, color: COLOR.slate }}>
                    {SPORT_LABEL[c.sport]}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt, marginTop: 4 }}>
                  {c.title}
                </Text>
              </View>
              {c.joined && (
                <View style={{ backgroundColor: COLOR.asphalt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 2 }}>
                  <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 10, color: COLOR.lime }}>
                    참여중
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
                {c.participants.length}명 참여중
              </Text>
              <View style={{ backgroundColor: COLOR.lime, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 11, color: COLOR.asphalt }}>
                  {c.days}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Custom challenge lock CTA */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: COLOR.slate,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLOR.concreteDark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={15} color={COLOR.slate} />
          </View>
          <View>
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.asphalt }}>
              커스텀 챌린지 만들기
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate }}>
              월 1,500원 구독 기능이에요
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {detail && (
        <ChallengeDetailOverlay
          challenge={detail}
          onClose={() => setDetail(null)}
          onToggleJoin={() => handleToggleJoin(detail)}
        />
      )}
      {templatesOpen && (
        <TemplatePickerOverlay
          templates={templates}
          groupName={groupName}
          onClose={() => setTemplatesOpen(false)}
          onStart={handleStartTemplate}
        />
      )}
    </SafeAreaView>
  );
}
