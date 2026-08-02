import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Flame } from "lucide-react-native";
import { COLOR } from "@/constants/theme";
import type { Sport } from "@/constants/theme";
import BibCard from "@/components/ui/BibCard";
import GroupsOverlay from "@/components/modals/GroupsOverlay";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Group, FeedEntry } from "@/types";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

export default function FeedScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const loadGroups = useCallback(async () => {
    if (!user) return;

    const { data: myMemberships } = await supabase
      .from("group_members")
      .select("group_id, role, groups(id, name, invite_code, owner_id)")
      .eq("user_id", user.id);

    if (!myMemberships?.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = myMemberships
      .map((m) => (m.groups as { id: string } | null)?.id)
      .filter((id): id is string => !!id);

    const { data: allMembers } = await supabase
      .from("group_members")
      .select("group_id, user_id, role, users(nickname, avatar_color)")
      .in("group_id", groupIds);

    const builtGroups: Group[] = myMemberships
      .map((membership) => {
        const g = membership.groups as {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
        } | null;
        if (!g) return null;

        const members = (allMembers ?? [])
          .filter((m) => m.group_id === g.id)
          .map((m) => {
            const u = m.users as { nickname: string; avatar_color: string } | null;
            return {
              id: m.user_id,
              name: u?.nickname ?? "?",
              color: u?.avatar_color ?? COLOR.slate,
              isOwner: g.owner_id === m.user_id,
            };
          });

        return {
          id: g.id,
          name: g.name,
          code: g.invite_code,
          isOwner: g.owner_id === user.id,
          streak: 0,
          members,
        };
      })
      .filter((g): g is Group => g !== null);

    setGroups(builtGroups);
    setActiveGroupId((prev) => prev ?? builtGroups[0]?.id ?? null);
    setLoading(false);
  }, [user]);

  const loadFeed = useCallback(async () => {
    if (!activeGroupId) return;

    const currentGroup = groups.find((g) => g.id === activeGroupId);
    if (!currentGroup) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: posts } = await supabase
      .from("posts")
      .select("user_id, sport, stats, route, created_at")
      .eq("group_id", activeGroupId)
      .gte("created_at", todayStart.toISOString());

    const postByUser = new Map((posts ?? []).map((p) => [p.user_id, p]));

    const feedEntries: FeedEntry[] = currentGroup.members.map((member) => {
      const post = postByUser.get(member.id);
      if (!post) {
        return {
          id: member.id,
          name: member.name,
          done: false,
          color: null,
          sport: null,
          time: null,
          stats: null,
        };
      }
      const date = new Date(post.created_at);
      const time = date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return {
        id: member.id,
        name: member.name,
        done: true,
        color: member.color,
        sport: post.sport as Sport,
        time,
        stats: post.stats as FeedEntry["stats"],
        route: post.route as [number, number][] | undefined,
      };
    });

    setFeed(feedEntries);
  }, [activeGroupId, groups]);

  const loadStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single();
    if (data) setStreak(data.current_streak);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
      loadStreak();
    }, [loadGroups, loadStreak])
  );

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLOR.concrete,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={COLOR.asphalt} />
      </SafeAreaView>
    );
  }

  if (!activeGroup) {
    return <NoGroupScreen userId={user?.id ?? ""} onGroupCreated={loadGroups} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => setGroupsOpen(true)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate }}>
              {activeGroup.name}
            </Text>
            <ChevronLeft
              size={12}
              color={COLOR.slate}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </View>
          <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: COLOR.asphalt }}>
            오늘의 인증
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 9999,
            backgroundColor: COLOR.asphalt,
          }}
        >
          <Flame size={16} color={COLOR.lime} />
          <Text style={{ fontFamily: FONT_MONO_BOLD, color: COLOR.lime, fontSize: 13 }}>
            {streak}
          </Text>
        </View>
      </View>

      {/* Feed list */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadFeed();
              setRefreshing(false);
            }}
            tintColor={COLOR.asphalt}
          />
        }
      >
        {feed.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>
              오늘 아직 인증한 멤버가 없어요
            </Text>
          </View>
        ) : (
          feed.map((entry) => <BibCard key={entry.id} member={entry} />)
        )}
      </ScrollView>

      <GroupsOverlay
        visible={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        groups={groups}
        activeGroupId={activeGroupId!}
        onSwitchGroup={(id) => {
          setActiveGroupId(id);
          setGroupsOpen(false);
        }}
        onOpenSubscribe={() => {}}
        onGroupsChanged={() => {
          setGroupsOpen(false);
          setActiveGroupId(null);
          loadGroups();
        }}
      />
    </SafeAreaView>
  );
}

function NoGroupScreen({ userId, onGroupCreated }: { userId: string; onGroupCreated: () => void }) {
  const [mode, setMode] = useState<"pick" | "create" | "join">("pick");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !userId) return;
    setLoading(true);
    try {
      const groupId = generateUUID();
      const code = generateInviteCode();
      const { error: gErr } = await supabase
        .from("groups")
        .insert({ id: groupId, name: groupName.trim(), owner_id: userId, invite_code: code });
      if (gErr) throw gErr;
      await supabase.from("group_members").insert({ group_id: groupId, user_id: userId, role: "owner" });
      onGroupCreated();
    } catch {
      Alert.alert("오류", "그룹 만들기에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (code.length !== 6 || !userId) return;
    setLoading(true);
    try {
      const { data: foundGroupId, error } = await supabase.rpc("group_id_by_invite", { code });
      if (error || !foundGroupId) { Alert.alert("오류", "초대코드를 찾을 수 없어요."); setLoading(false); return; }
      await supabase.from("group_members").insert({ group_id: foundGroupId, user_id: userId, role: "member" });
      onGroupCreated();
    } catch {
      Alert.alert("오류", "그룹 참여에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.concrete, paddingHorizontal: 24 }}>
      {mode === "pick" && (
        <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
          <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.asphalt, marginBottom: 8 }}>
            {"그룹이\n필요해요"}
          </Text>
          <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginBottom: 24 }}>
            인증을 시작하려면 그룹이 필요해요.{"\n"}새로 만들거나 초대코드로 참여하세요.
          </Text>
          <TouchableOpacity
            onPress={() => setMode("create")}
            style={{ backgroundColor: COLOR.lime, paddingVertical: 16, borderRadius: 16, alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 15, color: COLOR.asphalt }}>새 그룹 만들기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("join")}
            style={{ backgroundColor: COLOR.white, paddingVertical: 16, borderRadius: 16, alignItems: "center", borderWidth: 1.5, borderColor: COLOR.concreteDark }}
          >
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 15, color: COLOR.asphalt }}>초대코드로 참여하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "create" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TouchableOpacity onPress={() => setMode("pick")} style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.asphalt, marginBottom: 24 }}>
            그룹 이름
          </Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="예: 퇴근런 크루"
            placeholderTextColor={COLOR.slate}
            style={{
              backgroundColor: COLOR.white,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontFamily: FONT_BODY,
              fontSize: 15,
              color: COLOR.asphalt,
              borderWidth: 1.5,
              borderColor: groupName ? COLOR.asphalt : COLOR.concreteDark,
              marginBottom: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!groupName.trim() || loading}
            style={{ backgroundColor: COLOR.lime, paddingVertical: 16, borderRadius: 16, alignItems: "center", opacity: groupName.trim() && !loading ? 1 : 0.4 }}
          >
            {loading ? <ActivityIndicator color={COLOR.asphalt} /> : <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 15, color: COLOR.asphalt }}>만들기</Text>}
          </TouchableOpacity>
        </View>
      )}

      {mode === "join" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <TouchableOpacity onPress={() => setMode("pick")} style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate }}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLOR.asphalt, marginBottom: 24 }}>
            초대코드 입력
          </Text>
          <TextInput
            value={inviteCode}
            onChangeText={(v) => setInviteCode(v.toUpperCase().slice(0, 6))}
            placeholder="6자리 코드"
            placeholderTextColor={COLOR.slate}
            autoCapitalize="characters"
            maxLength={6}
            style={{
              backgroundColor: COLOR.white,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontFamily: "JetBrainsMono_700Bold",
              fontSize: 22,
              color: COLOR.asphalt,
              letterSpacing: 4,
              borderWidth: 1.5,
              borderColor: inviteCode.length === 6 ? COLOR.asphalt : COLOR.concreteDark,
              marginBottom: 16,
            }}
          />
          <TouchableOpacity
            onPress={handleJoin}
            disabled={inviteCode.length !== 6 || loading}
            style={{ backgroundColor: COLOR.lime, paddingVertical: 16, borderRadius: 16, alignItems: "center", opacity: inviteCode.length === 6 && !loading ? 1 : 0.4 }}
          >
            {loading ? <ActivityIndicator color={COLOR.asphalt} /> : <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 15, color: COLOR.asphalt }}>참여하기</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
