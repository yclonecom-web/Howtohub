import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENT_USER_DEFAULT, SAMPLE_CONTENT, SAMPLE_USERS } from '../utils/sampleData.js';
import { loadLocalPosts, subscribeToPosts } from '../services/api.js';

const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function AppProvider({ children }) {
  const [likes, setLikes] = useState(() => load('howtohub_likes', {}));
  const [bookmarks, setBookmarks] = useState(() => load('howtohub_bookmarks', {}));
  const [comments, setComments] = useState(() => load('howtohub_comments', {}));
  const [pins, setPins] = useState(() => load('howtohub_pins', {}));
  const [following, setFollowing] = useState(() => load('howtohub_following', {}));
  const [viewHistory, setViewHistory] = useState(() => load('howtohub_views', {}));
  const [userContent, setUserContent] = useState(() => loadLocalPosts());
  const [remotePosts, setRemotePosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(() =>
    load('howtohub_user', CURRENT_USER_DEFAULT),
  );
  const [notifications, setNotifications] = useState(() =>
    load('howtohub_notifications', { email: true, push: true, updates: false }),
  );
  const [privacy, setPrivacy] = useState(() =>
    load('howtohub_privacy', { profilePublic: true, showActivity: true }),
  );
  const [theme, setTheme] = useState(() => localStorage.getItem('howtohub_theme') || 'light');
  const [toast, setToast] = useState('');

  // Persist to localStorage whenever state changes
  useEffect(() => save('howtohub_likes', likes), [likes]);
  useEffect(() => save('howtohub_bookmarks', bookmarks), [bookmarks]);
  useEffect(() => save('howtohub_comments', comments), [comments]);
  useEffect(() => save('howtohub_pins', pins), [pins]);
  useEffect(() => save('howtohub_following', following), [following]);
  useEffect(() => save('howtohub_views', viewHistory), [viewHistory]);
  useEffect(() => save('howtohub_user_content', userContent), [userContent]);
  useEffect(() => save('howtohub_user', currentUser), [currentUser]);
  useEffect(() => save('howtohub_notifications', notifications), [notifications]);
  useEffect(() => save('howtohub_privacy', privacy), [privacy]);
  useEffect(() => {
    localStorage.setItem('howtohub_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Real-time Firestore subscription — merges remote posts into the feed
  useEffect(() => {
    const unsubscribe = subscribeToPosts((posts) => {
      setRemotePosts(posts);
    });
    return () => unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const toggleLike = useCallback((id) => {
    setLikes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const togglePin = useCallback((id) => {
    setPins((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFollow = useCallback((username) => {
    setFollowing((prev) => ({ ...prev, [username]: !prev[username] }));
  }, []);

  const addComment = useCallback(
    (id, text) => {
      const newComment = {
        author: currentUser.name,
        initials: currentUser.initials,
        text,
        time: 'Just now',
      };
      setComments((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), newComment],
      }));
      return newComment;
    },
    [currentUser.name, currentUser.initials],
  );

  const recordView = useCallback((id) => {
    setViewHistory((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const addUserPost = useCallback((post) => {
    setUserContent((prev) => [post, ...prev]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setNotification = useCallback((key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setPrivacySetting = useCallback((key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Combined content feed — remote + local user + sample, deduped by id
  const allContent = useMemo(() => {
    const seen = new Set();
    const merged = [];
    [...remotePosts, ...userContent, ...SAMPLE_CONTENT].forEach((c) => {
      if (!c || seen.has(c.id)) return;
      seen.add(c.id);
      merged.push(c);
    });
    return merged;
  }, [remotePosts, userContent]);

  const getContentById = useCallback(
    (id) => allContent.find((c) => String(c.id) === String(id)),
    [allContent],
  );

  const getBookmarkedContent = useCallback(
    () => allContent.filter((c) => bookmarks[c.id]),
    [allContent, bookmarks],
  );

  const getPinnedContent = useCallback(
    () => allContent.filter((c) => pins[c.id] || c.pinned),
    [allContent, pins],
  );

  const getViewCount = useCallback(
    (id) => {
      const base = allContent.find((c) => c.id === id)?.views || 0;
      return base + (viewHistory[id] || 0);
    },
    [allContent, viewHistory],
  );

  const getLikeCount = useCallback(
    (id) => {
      const base = allContent.find((c) => c.id === id)?.likes || 0;
      return base + (likes[id] ? 1 : 0);
    },
    [allContent, likes],
  );

  const getComments = useCallback(
    (id) => {
      const base = allContent.find((c) => c.id === id)?.comments || [];
      const user = comments[id] || [];
      return [...base, ...user];
    },
    [allContent, comments],
  );

  const value = useMemo(
    () => ({
      // state
      currentUser,
      allContent,
      users: SAMPLE_USERS,
      likes,
      bookmarks,
      pins,
      following,
      viewHistory,
      comments,
      theme,
      toast,
      notifications,
      privacy,
      // setters
      setCurrentUser,
      setTheme,
      toggleTheme,
      setNotification,
      setPrivacy: setPrivacySetting,
      // actions
      toggleLike,
      toggleBookmark,
      togglePin,
      toggleFollow,
      addComment,
      recordView,
      addUserPost,
      showToast,
      // selectors
      getContentById,
      getBookmarkedContent,
      getPinnedContent,
      getViewCount,
      getLikeCount,
      getComments,
      isLiked: (id) => !!likes[id],
      isBookmarked: (id) => !!bookmarks[id],
      isPinned: (id) => !!pins[id],
      isFollowing: (u) => !!following[u],
    }),
    [
      currentUser,
      allContent,
      likes,
      bookmarks,
      pins,
      following,
      viewHistory,
      comments,
      theme,
      toast,
      notifications,
      privacy,
      toggleTheme,
      setNotification,
      setPrivacySetting,
      toggleLike,
      toggleBookmark,
      togglePin,
      toggleFollow,
      addComment,
      recordView,
      addUserPost,
      showToast,
      getContentById,
      getBookmarkedContent,
      getPinnedContent,
      getViewCount,
      getLikeCount,
      getComments,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
