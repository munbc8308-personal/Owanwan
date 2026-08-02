import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock } from "lucide-react-native";
import { COLOR } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import SubscribeOverlay from "@/components/modals/SubscribeOverlay";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

interface RankEntry {
  userId: string;
  nickname: string;
  avatarColor: string;
  postCount: number;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const daysSinceMon = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceMon);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export default function RankingScreen() {
  const { user } = useAuth();
  const [rank, setRank] = useState<RankEntry[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const loadRanking = useCallback(async () => {
    if (!user) return;

    // Get user's first group + all members
    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      setLoading(false);
      return;
    }

    const g = membership.groups as { id: string; name: string } | null;
    if (!g) { setLoading(false); return; }
    setGroupName(g.name);

    // Get all members of the group with user info
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id, users(nickname, avatar_color)")
      .eq("group_id", g.id);

    // Get this week's posts for the group
    const weekStart = getWeekStart();
    const { data: weekPosts } = await supabase
      .from("posts")
      .select("user_id")
      .eq("group_id", g.id)
      .gte("created_at", weekStart.toISOString());

    // Count posts per user
    const countMap = new Map<string, number>();
    for (const post of weekPosts ?? []) {
      countMap.set(post.user_id, (countMap.get(post.user_id) ?? 0) + 1);
    }

    // Build ranked list
    const entries: RankEntry[] = (members ?? []).map((m) => {
      const u = m.users as { nickname: string; avatar_color: string } | null;
      return {
        userId: m.user_id,
        nickname: u?.nickname ?? "?",
        avatarColor: u?.avatar_color ?? COLOR.slate,
        postCount: countMap.get(m.user_id) ?? 0,
      };
    });

    entries.sort((a, b) => b.postCount - a.postCount);
    setRank(entries);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadRanking();
    }, [loadRanking])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRanking();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLOR.asphalt} />
      </SafeAreaView>
    );
  }

  const weekStart = getWeekStart();
  const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} 주`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLOR.asphalt} />
        }
      >
        <View style={{ paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: COLOR.asphalt }}>
            이번 주 랭킹
          </Text>
          <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.slate }}>
            {groupName ? `${groupName} · ` : ""}{weekLabel} 인증 횟수
          </Text>
        </View>

        {/* Group ranking */}
        {rank.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>
              이번 주 아직 인증한 멤버가 없어요
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8, marginBottom: 24 }}>
            {rank.map((entry, i) => {
              const isFirst = i === 0;
              const isMe = entry.userId === user?.id;
              return (
                <View
                  key={entry.userId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    backgroundColor: isMe ? COLOR.asphalt : COLOR.white,
                    borderWidth: 1.5,
                    borderColor: isMe ? COLOR.asphalt : COLOR.concreteDark,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text
                      style={{
                        fontFamily: FONT_MONO_BOLD,
                        fontSize: 13,
                        color: isFirst ? COLOR.red : (isMe ? COLOR.slate : COLOR.slate),
                        width: 20,
                      }}
                    >
                      {i + 1}
                    </Text>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: entry.avatarColor,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: COLOR.asphalt }}>
                        {entry.nickname[0]}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: FONT_BODY_BOLD,
                        fontSize: 14,
                        color: isMe ? COLOR.white : COLOR.asphalt,
                      }}
                    >
                      {entry.nickname}
                      {isMe ? "  (나)" : ""}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontFamily: FONT_MONO_BOLD,
                        fontSize: 16,
                        color: isMe ? COLOR.lime : COLOR.asphalt,
                      }}
                    >
                      {entry.postCount}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10,
                        color: isMe ? COLOR.slate : COLOR.slate,
                      }}
                    >
                      회
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Global ranking (locked) */}
        <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginBottom: 8 }}>
          전체 랭킹
        </Text>
        <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: COLOR.white }}>
          <View style={{ padding: 16, gap: 12, opacity: 0.15 }}>
            {["서울 러너1 · 7회", "서울 러너2 · 6회", "서울 러너3 · 5회"].map((t, i) => (
              <Text key={i} style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLOR.asphalt }}>
                {t}
              </Text>
            ))}
          </View>
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(237,235,230,0.85)",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Lock size={18} color={COLOR.asphalt} />
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 12, color: COLOR.asphalt }}>
              월 1,500원으로 잠금 해제
            </Text>
            <TouchableOpacity
              onPress={() => setSubscribeOpen(true)}
              style={{
                backgroundColor: COLOR.lime,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginTop: 4,
              }}
            >
              <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 12, color: COLOR.asphalt }}>
                구독하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SubscribeOverlay visible={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </SafeAreaView>
  );
}
