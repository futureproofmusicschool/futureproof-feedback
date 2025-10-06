const PARENT_FEED_URL = 'https://learn.futureproofmusicschool.com/feedback';

function isInIframe(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.self !== window.top;
  } catch (error) {
    return true;
  }
}

export function goToParentFeed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!PARENT_FEED_URL) {
    return false;
  }

  if (isInIframe()) {
    try {
      window.top?.location.assign(PARENT_FEED_URL);
      return true;
    } catch (error) {
      // Fall through to regular navigation
    }
  }

  try {
    const parentUrl = new URL(PARENT_FEED_URL);
    if (window.location.origin === parentUrl.origin) {
      if (window.location.href !== parentUrl.href) {
        window.location.assign(parentUrl.href);
      } else {
        window.location.reload();
      }
      return true;
    }
  } catch (error) {
    console.error('Failed to navigate to parent feed:', error);
  }

  return false;
}

export { PARENT_FEED_URL };
