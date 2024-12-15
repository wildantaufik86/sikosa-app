const putAuthUserSession = (authUser) => {
  if (authUser) {
    sessionStorage.setItem("authUser", JSON.stringify(authUser));
  }
};

const getAuthUserSession = () => {
  return sessionStorage.getItem("authUser") || null;
};

const putAccessTokenSession = (accessToken) => {
  if (accessToken) {
    sessionStorage.setItem("accessToken", accessToken);
  }

  return false;
};

const getAccessToken = () => {
  return sessionStorage.getItem("accessToken") || null;
};

export {
  putAccessTokenSession,
  getAccessToken,
  getAuthUserSession,
  putAuthUserSession,
};
