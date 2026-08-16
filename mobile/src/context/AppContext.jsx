// Global app state for the BrainWave mobile client.
// Bridges Clerk auth with the API service and holds course/enrollment data
// shared across screens — mirroring the web client's AppContext behavior.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  setTokenProvider,
  setOnUnauthorized,
  getAllCourses,
  getUserData,
  getEnrolledCourses,
  updateRoleToEducator,
} from '../services/api';

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const { getToken, signOut, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  const [userData, setUserData] = useState(null);

  const isEducator = user?.publicMetadata?.role === 'educator';

  const [becomingEducator, setBecomingEducator] = useState(false);

  const becomeEducator = useCallback(async () => {
    setBecomingEducator(true);
    try {
      await updateRoleToEducator();
      // Force a refetch of the user object so publicMetadata updates.
      if (user) {
        await user.reload();
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to switch role' };
    } finally {
      setBecomingEducator(false);
    }
  }, [user]);

  // Keep the API service in sync with Clerk's token provider.
  useEffect(() => {
   setTokenProvider(() => getToken());
    setOnUnauthorized(() => () => {
      // Session expired / revoked — let Clerk sign the user out gracefully.
      if (typeof signOut === 'function') {
        signOut();
      }
    });
    return () => {
      setTokenProvider(null);
      setOnUnauthorized(null);
    };
  }, [getToken, signOut]);

  const fetchAllCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const courses = await getAllCourses();
      setAllCourses(courses);
    } catch (err) {
      setCoursesError(err.message || 'Failed to load courses');
      setAllCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const data = await getUserData();
      setUserData(data);
    } catch (err) {
      // Non-fatal; Clerk still holds the profile.
      setUserData(null);
    }
  }, []);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!isSignedIn) return;
    setEnrolledLoading(true);
    try {
      const courses = await getEnrolledCourses();
      setEnrolledCourses(courses);
    } catch (err) {
      setEnrolledCourses([]);
    } finally {
      setEnrolledLoading(false);
    }
  }, [isSignedIn]);

  // Initial load of the public course catalog once.
  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  // Load personal data whenever a user signs in.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserData();
      fetchEnrolledCourses();
    }
  }, [isLoaded, isSignedIn, fetchUserData, fetchEnrolledCourses]);

  const value = useMemo(
    () => ({
      // Auth
      isLoaded,
      isSignedIn,
      user,
      isEducator,

      // Catalog
      allCourses,
      coursesLoading,
      coursesError,
      fetchAllCourses,

            // Personal
      userData,
      enrolledCourses,
      enrolledLoading,
      fetchUserData,
      fetchEnrolledCourses,

      // Educator actions
      becomingEducator,
      becomeEducator,

      // Actions
      pullToRefresh: async () => {
        await Promise.all([fetchAllCourses(), fetchEnrolledCourses(), fetchUserData()]);
      },
    }),
    [
      isLoaded,
      isSignedIn,
      user,
      isEducator,
      allCourses,
      coursesLoading,
      coursesError,
      fetchAllCourses,
      userData,
      enrolledCourses,
      enrolledLoading,
      fetchUserData,
      fetchEnrolledCourses,
      becomingEducator,
      becomeEducator,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppContextProvider');
  return ctx;
}

export default AppContext;