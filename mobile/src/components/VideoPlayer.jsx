import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '../constants/theme';
import { getYouTubeVideoId } from '../utils/format';

/**
 * Expo-compatible video player for YouTube lectures.
 * Lecture URLs are YouTube links (the web app uses react-youtube), so we
 * embed the YouTube player inside a WebView, which works on Android.
 */
export default function VideoPlayer({ lectureUrl, style }) {
  const videoId = getYouTubeVideoId(lectureUrl);

  if (!videoId) {
    return (
      <View style={[styles.wrap, style, styles.empty]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

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
        onHttpError={(syntheticEvent) => onLoadError(syntheticEvent)}
      />
    </View>
  );
}

function onLoadError(syntheticEvent) {
  const { nativeEvent } = syntheticEvent;
  if (nativeEvent.statusCode >= 400 && __DEV__) {
    // Log only in development. Never surface raw stack traces to users.
  }
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
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937' },
});