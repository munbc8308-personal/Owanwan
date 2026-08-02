import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { COLOR, SPORT_LABEL } from "@/constants/theme";
import type { Challenge } from "@/types";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

interface ChallengeDetailOverlayProps {
  challenge: Challenge;
  onClose: () => void;
  onToggleJoin: () => Promise<void>;
}

export default function ChallengeDetailOverlay({
  challenge,
  onClose,
  onToggleJoin,
}: ChallengeDetailOverlayProps) {
  const [toggling, setToggling] = useState(false);
  const insets = useSafeAreaInsets();

  const sorted = [...challenge.participants].sort((a, b) => b.progress - a.progress);
  const total = challenge.participants.reduce((s, p) => s + p.progress, 0);
  const numerator = challenge.groupGoal ? total : (challenge.participants.find(() => true)?.progress ?? 0);
  const pct = Math.min(100, Math.round((numerator / challenge.goal) * 100));

  const handleToggle = () => {
    if (challenge.joined) {
      Alert.alert(
        "챌린지 그만두기",
        `"${challenge.title}" 챌린지를 그만둘까요? 진행 기록이 사라져요.`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "그만두기",
            style: "destructive",
            onPress: async () => {
              setToggling(true);
              await onToggleJoin();
              setToggling(false);
            },
          },
        ]
      );
    } else {
      setToggling(true);
      onToggleJoin().finally(() => setToggling(false));
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: COLOR.concrete }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: insets.top + 4,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <X size={20} color={COLOR.asphalt} />
          </TouchableOpacity>
          <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.slate }}>
            챌린지
          </Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          {/* Sport tag */}
          <View
            style={{
              backgroundColor: COLOR.asphalt,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 9, color: COLOR.lime }}>
              {SPORT_LABEL[challenge.sport]}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 30,
              color: COLOR.asphalt,
              lineHeight: 32,
              marginTop: 4,
            }}
          >
            {challenge.title}
          </Text>
          <Text
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: COLOR.slate,
              lineHeight: 20,
              marginTop: 8,
            }}
          >
            {challenge.desc}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 12,
              backgroundColor: COLOR.asphalt,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 11, color: COLOR.lime }}>
              {challenge.period}
            </Text>
          </View>

          {/* Progress */}
          <View
            style={{
              marginTop: 24,
              borderRadius: 16,
              padding: 16,
              backgroundColor: COLOR.asphalt,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate }}>
                {challenge.groupGoal ? "그룹 합산 진행률" : "진행률"}
              </Text>
              <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 13, color: COLOR.lime }}>
                {numerator}/{challenge.goal}{challenge.unit}
              </Text>
            </View>
            <View
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#3A3B3E",
                marginTop: 12,
              }}
            >
              <View
                style={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: COLOR.lime,
                  width: `${pct}%`,
                }}
              />
            </View>
          </View>

          {/* Participants */}
          {sorted.length > 0 && (
            <>
              <Text
                style={{
                  fontFamily: FONT_BODY_BOLD,
                  fontSize: 11,
                  color: COLOR.slate,
                  marginTop: 24,
                }}
              >
                참여자 {sorted.length}명
              </Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {sorted.map((p, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: COLOR.white,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Text
                        style={{
                          fontFamily: FONT_MONO_BOLD,
                          fontSize: 13,
                          color: i === 0 ? COLOR.red : COLOR.slate,
                          width: 16,
                        }}
                      >
                        {i + 1}
                      </Text>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: p.color,
                        }}
                      />
                      <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 14, color: COLOR.asphalt }}>
                        {p.name}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 13, color: COLOR.asphalt }}>
                      {p.progress}{challenge.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Rules */}
          {challenge.rules.length > 0 && (
            <>
              <Text
                style={{
                  fontFamily: FONT_BODY_BOLD,
                  fontSize: 11,
                  color: COLOR.slate,
                  marginTop: 24,
                }}
              >
                참여 규칙
              </Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {challenge.rules.map((r, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: COLOR.slate,
                        marginTop: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 13,
                        color: COLOR.asphalt,
                        lineHeight: 20,
                        flex: 1,
                      }}
                    >
                      {r}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Join/Leave button */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={handleToggle}
            disabled={toggling}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: challenge.joined ? "transparent" : COLOR.lime,
              borderWidth: challenge.joined ? 1.5 : 0,
              borderColor: challenge.joined ? COLOR.slate : undefined,
            }}
          >
            {toggling ? (
              <ActivityIndicator color={challenge.joined ? COLOR.slate : COLOR.asphalt} />
            ) : (
              <Text
                style={{
                  fontFamily: FONT_BODY_EXTRABOLD,
                  fontSize: 15,
                  color: challenge.joined ? COLOR.slate : COLOR.asphalt,
                }}
              >
                {challenge.joined ? "챌린지 그만두기" : "참여하기"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
