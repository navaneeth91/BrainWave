import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';
import { getYouTubeVideoId, isYouTubeUrl } from '../utils/format';

/**
 * Expo-compatible video player for BrainWave lectures.
 *
 * - YouTube lecture URLs are rendered inside a WebView embed (same behaviour
 *   as the web app's react-youtube player).
 * - Cloudinary / direct video URLs (educator-uploaded lectures) are played
 *   with expo-video's native player, mirroring the web <video> element.
 *
 * `onEnded` is fired when a native (Cloudinary) video reaches the end so the
 * Player can auto-mark the lecture as complete (exactly like the web app).
 */
export default function VideoPlayer({ lectureUrl, onEnded, style, thumbnailUrl }) {
  const videoId = getYouTubeVideoId(lectureUrl);

  // Still "loading" while we figure out which engine to use / before a lecture.
  if (!lectureUrl) {
    return (
      <View style={[styles.wrap, style, styles.emptyWrap]}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Ionicons name="play-circle-outline" size={44} color={colors.white} />
        )}
      </View>
    );
  }

  if (isYouTubeUrl(lectureUrl) && videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
    return (
      <View style={[styles.wrap, style]}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      </View>
    );
  }

  // Cloudinary / direct MP4 – native playback via expo-video.
  return (
    <CloudinaryVideo url={lectureUrl} onEnded={onEnded} style={style} />
  );
}

function CloudinaryVideo({ url, onEnded, style }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.addListener('playToEnd', () => {
      if (typeof onEnded === 'function') {
        onEnded();
      }
    });
  });

  return (
    <View style={[styles.wrap, style]}>
      <VideoView
        player={player}
        style={styles.webview}
        nativeControls
        allowsFullscreen
        contentFit="contain"
        surfaceType="textureView"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  webview: { flex: 1, backgroundColor: '#000' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937' },
});