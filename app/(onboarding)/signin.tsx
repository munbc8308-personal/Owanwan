import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { COLOR } from "@/constants/theme";
import { useAuth } from "@/lib/auth";

const FONT_DISPLAY = "BebasNeue_400Regular";
const FONT_BODY = "Manrope_400Regular";
const FONT_BODY_BOLD = "Manrope_700Bold";
const FONT_BODY_EXTRABOLD = "Manrope_800ExtraBold";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = !email || password.length < 6;

  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
      return;
    }
    router.replace("/(tabs)/feed");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.asphalt }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: 24 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, marginBottom: 32, alignSelf: "flex-start" }}
        >
          <ChevronLeft size={24} color={COLOR.white} />
        </TouchableOpacity>

        {/* Header */}
        <Text style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color: COLOR.white, lineHeight: 42 }}>
          {"다시\n만났네요"}
        </Text>
        <Text style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLOR.slate, marginTop: 12 }}>
          계속 인증을 이어가보세요.
        </Text>

        {/* Inputs */}
        <View style={{ marginTop: 40, gap: 12 }}>
          <TextInput
            value={email}
            onChangeText={(v) => { setEmail(v); setError(""); }}
            placeholder="이메일"
            placeholderTextColor={COLOR.slate}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderRadius: 16,
              backgroundColor: "#2A2B2E",
              borderWidth: 1.5,
              borderColor: email ? COLOR.lime : "#3A3B3E",
              fontFamily: FONT_BODY,
              fontSize: 15,
              color: COLOR.white,
            }}
          />

          <View>
            <TextInput
              value={password}
              onChangeText={(v) => { setPassword(v); setError(""); }}
              placeholder="비밀번호"
              placeholderTextColor={COLOR.slate}
              secureTextEntry={!showPassword}
              onSubmitEditing={handleSignIn}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                paddingRight: 52,
                borderRadius: 16,
                backgroundColor: "#2A2B2E",
                borderWidth: 1.5,
                borderColor: password.length >= 6 ? COLOR.lime : "#3A3B3E",
                fontFamily: FONT_BODY,
                fontSize: 15,
                color: COLOR.white,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={{ position: "absolute", right: 16, top: 16 }}
            >
              {showPassword
                ? <Eye size={20} color={COLOR.slate} />
                : <EyeOff size={20} color={COLOR.slate} />
              }
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={{ fontFamily: FONT_BODY, fontSize: 12, color: COLOR.red }}>
              {error}
            </Text>
          ) : null}
        </View>

        {/* CTA */}
        <View style={{ marginTop: "auto", paddingBottom: 32, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isDisabled || loading}
            style={{
              backgroundColor: COLOR.lime,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              opacity: isDisabled ? 0.4 : 1,
            }}
          >
            {loading
              ? <ActivityIndicator color={COLOR.asphalt} />
              : <Text style={{ fontFamily: FONT_BODY_EXTRABOLD, fontSize: 15, color: COLOR.asphalt }}>로그인</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
