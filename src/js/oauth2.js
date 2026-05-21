const oAuth2 = (() => {
  const AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
  const CLIENT_ID = 'Ov23liLHsYAlqe7VvDH3';
  const REDIRECT_URL = 'https://github.com/';
  const SCOPES = ['repo'];

  return {
    begin() {
      const scopeParam = encodeURIComponent(SCOPES.join(' '));
      const url = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&scope=${scopeParam}`;

      chrome.storage.local.set({ pipe_leethub: true }, () => {
        chrome.tabs.create({ url, active: true }, () => {});
      });
    },
  };
})();

window.oAuth2 = oAuth2;
