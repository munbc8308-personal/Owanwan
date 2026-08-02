import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth";
import { COLOR } from "@/constants/theme";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLOR.asphalt }}>
        <ActivityIndicator color={COLOR.lime} />
      </View>
    );
  }

  return session ? <Redirect href="/(tabs)/feed" /> : <Redirect href="/(onboarding)" />;
}
