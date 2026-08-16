import { useCallback, useEffect, useState } from 'react';
import { getCourseProgress } from '../services/api';

/**
 * Fetch course progress for a list of courses in parallel.
 * Returns a map keyed by course._id plus a reload function.
 */
export default function useProgressMap(courses = []) {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const list = courses || [];
    if (list.length === 0) {
      setProgressMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const unique = list.filter((c, i, arr) => arr.findIndex((x) => x._id === c._id) === i);
    const entries = await Promise.all(
      unique.map(async (c) => {
        try {
          const p = await getCourseProgress(c._id);
          return [c._id, p];
        } catch (e) {
          return [c._id, null];
        }
      })
    );
    setProgressMap(Object.fromEntries(entries));
    setLoading(false);
  }, [courses]);

  useEffect(() => {
    load();
  }, [load]);

  return { progressMap, progressLoading: loading, reload: load };
}