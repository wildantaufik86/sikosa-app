const putAuthUserSession = (authUser) => {
  if (authUser) {
    sessionStorage.setItem("authUser", JSON.stringify(authUser));
    return true;
  }

  return false;
};

const getAuthUserSession = () => {
  const authUser = sessionStorage.getItem("authUser");
  return authUser ? JSON.parse(authUser) : null;
};

const putAccessTokenSession = (accessToken) => {
  if (accessToken) {
    sessionStorage.setItem("accessToken", accessToken);
    return true; // Berhasil disimpan
  }
  return false; // Gagal menyimpan
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