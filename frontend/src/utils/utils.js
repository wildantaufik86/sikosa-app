const putAuthUserSession = (authUser) => {
  if (authUser) {
    localStorage.setItem("authUser", JSON.stringify(authUser));
    return true;
  }

  return false;
};

const getAuthUserSession = () => {
  const authUser = localStorage.getItem("authUser");
  return authUser ? JSON.parse(authUser) : null;
};

const putAccessTokenSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    return true; // Berhasil disimpan
  }
  return false; // Gagal menyimpan
};

const getAccessToken = () => {
  return localStorage.getItem("accessToken") || null;
};

const formattedDate = (date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formattedTitle = (title) => {
  if (title.length > 50) {
    return title.slice(0, 50) + "...";
  }

  return title;
};

const formattedString = (string) => {
  return string
    .split(" ")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    })
    .join(" ");
};

export {
  putAccessTokenSession,
  getAccessToken,
  getAuthUserSession,
  putAuthUserSession,
  formattedDate,
  formattedTitle,
  formattedString,
};
