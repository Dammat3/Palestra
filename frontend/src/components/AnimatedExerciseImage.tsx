/**
 * Animated exercise image: alternates between 2 frames to simulate a GIF.
 * Falls back to single frame if only one image available.
 */
import { useEffect, useState } from "react";
import { ImageStyle, StyleProp } from "react-native";
import { Image, ImageContentFit } from "expo-image";

type Props = {
  images?: string[] | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  intervalMs?: number;
  paused?: boolean;
};

export function AnimatedExerciseImage({
  images,
  style,
  contentFit = "cover",
  intervalMs = 700,
  paused = false,
}: Props) {
  const [idx, setIdx] = useState(0);
  const frames = (images || []).filter(Boolean);

  useEffect(() => {
    if (paused || frames.length < 2) return;
    const i = setInterval(() => setIdx((v) => (v + 1) % frames.length), intervalMs);
    return () => clearInterval(i);
  }, [frames.length, intervalMs, paused]);

  if (frames.length === 0) return null;

  return (
    <Image
      source={{ uri: frames[idx] }}
      style={style}
      contentFit={contentFit}
      transition={150}
      cachePolicy="memory-disk"
    />
  );
}
