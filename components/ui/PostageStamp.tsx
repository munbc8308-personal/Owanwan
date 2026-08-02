import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";
import { COLOR } from "@/constants/theme";

const FONT_MONO_BOLD = "JetBrainsMono_700Bold";

interface PostageStampProps {
  children: string;
  animated?: boolean;
}

export default function PostageStamp({ children, animated = false }: PostageStampProps) {
  const scale = useSharedValue(animated ? 0 : 1);
  const rotate = useSharedValue(animated ? -18 : -7);
  const opacity = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (animated) {
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
      opacity.value = withSpring(1);
      rotate.value = withSpring(-7, { damping: 10, stiffness: 150 });
    }
  }, [animated]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <View
        style={{
          backgroundColor: COLOR.white,
          borderWidth: 2,
          borderColor: COLOR.red,
          padding: 3,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: COLOR.red,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontFamily: FONT_MONO_BOLD,
              fontWeight: "700",
              fontSize: 11,
              color: COLOR.red,
            }}
            numberOfLines={1}
          >
            {children}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
