import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Check } from "lucide-react-native";
import { COLOR } from "@/constants/theme";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";
const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

const FEATURES = [
  "영상 기록 업로드 (최대 1분)",
  "사진 원본 화질 저장 + 무기한 보관",
  "전체·세그먼트 랭킹 확인",
  "그룹 무제한 생성",
  "커스텀 챌린지 만들기",
  "데이터 내보내기(CSV)",
];

interface SubscribeOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function SubscribeOverlay({ visible, onClose }: SubscribeOverlayProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [done, setDone] = useState(false);
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: COLOR.concrete }}>
        {done ? (
          <View style={{ backgroundColor: COLOR.asphalt }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLOR.lime, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Check size={28} color={COLOR.asphalt} />
            </View>
            <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLOR.white, textAlign: "center" }}>
              구독이 완료됐어요
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
              {plan === "yearly" ? "연 15,000원" : "월 1,500원"} 결제가 확인됐어요.{"\n"}이제 모든 기능을 사용할 수 있어요.
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                marginTop: 32,
                width: "100%",
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: COLOR.lime,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                시작하기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={20} color={COLOR.asphalt} />
              </TouchableOpacity>
              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.slate }}>
                구독하기
              </Text>
              <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 11, color: COLOR.red, letterSpacing: 1.5 }}>
                OWANWAN UNLOCK
              </Text>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: COLOR.asphalt, lineHeight: 34, marginTop: 4 }}>
                {"더 진하게\n기록해보세요"}
              </Text>

              {/* Plan toggle */}
              <View>
                {(["monthly", "yearly"] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPlan(p)}
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor: plan === p ? COLOR.asphalt : COLOR.white,
                      borderWidth: 1.5,
                      borderColor: plan === p ? COLOR.asphalt : COLOR.concreteDark,
                      position: "relative",
                    }}
                  >
                    {p === "yearly" && (
                      <View style={{ position: "absolute", top: -8, right: 12, backgroundColor: COLOR.red, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                        <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 9, color: COLOR.white }}>
                          17% 할인
                        </Text>
                      </View>
                    )}
                    <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 12, color: COLOR.slate }}>
                      {p === "monthly" ? "월간" : "연간"}
                    </Text>
                    <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: plan === p ? COLOR.lime : COLOR.asphalt, marginTop: 2 }}>
                      {p === "monthly" ? "1,500원" : "15,000원"}
                    </Text>
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate }}>
                      {p === "monthly" ? "매월" : "월 1,250원 꼴"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Features list */}
              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 11, color: COLOR.slate, marginTop: 24 }}>
                구독하면 이런 게 열려요
              </Text>
              <View style={{ marginTop: 8, borderRadius: 16, overflow: "hidden", backgroundColor: COLOR.white, borderWidth: 1.5, borderColor: COLOR.concreteDark }}>
                {FEATURES.map((f, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0,
                      borderBottomColor: COLOR.concreteDark,
                    }}
                  >
                    <Check size={14} color={COLOR.asphalt} />
                    <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.asphalt }}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate, textAlign: "center", marginTop: 16 }}>
                광고 없이 운영돼요 · 언제든 해지할 수 있어요
              </Text>
            </ScrollView>

            {/* CTA */}
            <View>
              <TouchableOpacity
                onPress={() => setDone(true)}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: COLOR.lime,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                  {plan === "yearly" ? "연 15,000원 결제하기" : "월 1,500원 결제하기"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
