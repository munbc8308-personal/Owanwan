import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Check, RotateCcw } from "lucide-react-native";
import { PACKAGE_TYPE, type PurchasesPackage } from "react-native-purchases";
import { COLOR } from "@/constants/theme";
import { usePurchases } from "@/lib/purchases";

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
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const insets = useSafeAreaInsets();

  const { isPremium, packages, purchasePackage, restorePurchases, refresh, loading } = usePurchases();

  useEffect(() => {
    if (visible) {
      refresh();
      if (isPremium) setDone(true);
    }
  }, [visible]);

  useEffect(() => {
    if (isPremium && visible && !done) setDone(true);
  }, [isPremium]);

  const handleClose = () => {
    setDone(false);
    setPurchasing(false);
    setRestoring(false);
    onClose();
  };

  const findPackage = (type: "monthly" | "yearly"): PurchasesPackage | undefined =>
    packages.find((p) =>
      type === "monthly"
        ? p.packageType === PACKAGE_TYPE.MONTHLY
        : p.packageType === PACKAGE_TYPE.ANNUAL
    );

  const priceLabel = (type: "monthly" | "yearly") => {
    const pkg = findPackage(type);
    if (pkg?.product.priceString) return pkg.product.priceString;
    return type === "monthly" ? "₩1,500" : "₩15,000";
  };

  const handlePurchase = async () => {
    const pkg = findPackage(plan);
    if (!pkg) {
      Alert.alert("오류", "상품 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setPurchasing(true);
    const { success, error } = await purchasePackage(pkg);
    setPurchasing(false);
    if (success) {
      setDone(true);
    } else if (error) {
      Alert.alert("결제 실패", error);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const { success, error } = await restorePurchases();
    setRestoring(false);
    if (success) {
      setDone(true);
    } else {
      Alert.alert("복원 실패", error ?? "이전 구독 내역을 찾지 못했어요.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: COLOR.concrete }}>
        {done ? (
          <View
            style={{
              flex: 1,
              backgroundColor: COLOR.asphalt,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
              paddingTop: insets.top,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLOR.lime,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Check size={32} color={COLOR.asphalt} />
            </View>
            <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: COLOR.white, textAlign: "center" }}>
              구독이 완료됐어요
            </Text>
            <Text style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLOR.slate, marginTop: 12, textAlign: "center", lineHeight: 20 }}>
              이제 모든 기능을 사용할 수 있어요.
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{ marginTop: 40, width: "100%", paddingVertical: 16, borderRadius: 16, backgroundColor: COLOR.lime, alignItems: "center" }}
            >
              <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                시작하기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: insets.top + 12,
                paddingBottom: 12,
              }}
            >
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={20} color={COLOR.asphalt} />
              </TouchableOpacity>
              <Text style={{ fontFamily: FONT_BODY_BOLD, fontSize: 13, color: COLOR.slate }}>
                구독하기
              </Text>
              <TouchableOpacity onPress={handleRestore} disabled={restoring} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                {restoring
                  ? <ActivityIndicator size="small" color={COLOR.slate} />
                  : <RotateCcw size={18} color={COLOR.slate} />
                }
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20, paddingTop: 8 }}>
              <Text style={{ fontFamily: FONT_MONO_BOLD, fontSize: 11, color: COLOR.red, letterSpacing: 1.5 }}>
                OWANWAN UNLOCK
              </Text>
              <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: COLOR.asphalt, lineHeight: 42, marginTop: 4 }}>
                {"더 진하게\n기록해보세요"}
              </Text>

              {loading ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator color={COLOR.asphalt} />
                </View>
              ) : (
                <View style={{ gap: 10, marginTop: 20 }}>
                  {(["yearly", "monthly"] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPlan(p)}
                      style={{
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
                        {priceLabel(p)}
                      </Text>
                      <Text style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLOR.slate }}>
                        {p === "monthly" ? "매월" : "월 환산 ₩1,250"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

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

            <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
              <TouchableOpacity
                onPress={handlePurchase}
                disabled={purchasing || loading}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: purchasing || loading ? COLOR.concreteDark : COLOR.lime,
                  alignItems: "center",
                }}
              >
                {purchasing
                  ? <ActivityIndicator color={COLOR.asphalt} />
                  : (
                    <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>
                      {plan === "yearly" ? `연간 ${priceLabel("yearly")} 결제하기` : `월간 ${priceLabel("monthly")} 결제하기`}
                    </Text>
                  )
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
