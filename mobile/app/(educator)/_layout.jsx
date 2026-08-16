import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../../src/components/RequireAuth';
import RequireEducator from '../../src/components/RequireEducator';
import { colors } from '../../src/constants/theme';

/**
 * Tab navigator for educator-specific screens.
 * Only renders for users whose Clerk publicMetadata.role === 'educator'.
 */
export default function EducatorTabsLayout() {
  return (
    <RequireAuth>
      <RequireEducator>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primaryDark,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.borderLight,
              height: 62,
              paddingBottom: 8,
              paddingTop: 6,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="courses"
            options={{
              title: 'My Courses',
              tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
            }}
          />
        </Tabs>
      </RequireEducator>
    </RequireAuth>
  );
}
