(function () {
  const home = window.HejHubHome || {};

  home.rotateHeadline?.();
  home.setupModeSwitch?.();
  HejHub.setupPhysicality('.tile');
  home.rotateYouTubeThumb?.();
  home.rotateFallbackAlbum?.();

  Promise.allSettled([
    home.loadGitHubDots?.(),
    home.loadYouTubeSubscriberCount?.(),
    home.loadLetterboxd?.(),
    home.loadAppleAlbum?.(),
    home.loadBookRecommendation?.()
  ]);
})();
