import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFn, options = {}) {
  const { immediate = true } = options;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!!immediate && !!apiFn);
  const [error, setError]     = useState(null);

  // This ref tracks whether the component is still mounted
  const mountedRef = useRef(true);

  const execute = useCallback(async (overrideFn) => {
    const fn = overrideFn || apiFn;
    if (!fn) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fn();
      // CRITICAL: only setState if component is still mounted
      if (mountedRef.current) {
        setData(res.data);
      }
      return res.data;
    } catch (err) {
      if (mountedRef.current) {
        // FastAPI errors come back as err.response.data.detail
        const message =
          err.response?.data?.detail ||
          err.message ||
          'Something went wrong';
        setError(message);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFn]);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate && apiFn) {
      execute();
    }

    // Cleanup: flip the flag when component leaves the DOM
    return () => {
      mountedRef.current = false;
    };
  }, []); // eslint-disable-line

  return { data, loading, error, execute, refetch: execute };
}