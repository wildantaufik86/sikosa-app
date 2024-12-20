import CONFIG from "../config/config";
import { getAccessToken } from "./utils";

const updateProfile = async (formData) => {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("Invalid accessToken");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    return { error: false, message: result.message, data: result.data };
  } catch (error) {
    return { error: true, message: error.message, data: null };
  }
};

const updateProfilePsikolog = async (formData) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid accessToken");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/psikolog/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    return { error: false, message: result.message, data: result.data };
  } catch (error) {
    return { error: true, message: error.message, data: null };
  }
};

const getAllPsikolog = async () => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/user/psikolog/all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get psikologs");
    }

    const result = await response.json();
    if (result.data) {
      return { error: false, psikologs: result.data };
    }
  } catch (error) {
    return { error: true, psikologs: null };
  }
};

const getPsikologById = async (psikologId) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/user/psikolog/${psikologId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get detail psikolog");
    }

    const result = await response.json();
    return { error: false, message: result.message, data: result.data };
  } catch (error) {
    return { error: true, message: error.message, data: null };
  }
};

const getArticles = async () => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/api/v1/articles`);
    if (!response.ok) {
      throw new Error("Failed to get articles");
    }
    const result = await response.json();
    return { error: false, message: result.message, articles: result.data };
  } catch (error) {
    return { error: true, message: error.message, articles: null };
  }
};

const getArticlesByWriter = async (writerId) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/api/v1/articles`);
    if (!response.ok) {
      throw new Error("Failed to get articles");
    }
    const result = await response.json();
    const articlesFilter = result.data.filter((article) => article.writer === writerId);
    return { error: false, message: result.message, articles: articlesFilter };
  } catch (error) {
    return { error: true, message: error.message, articles: null };
  }
};

const getArticleBySlug = async (slug) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/api/v1/articles/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to get articles");
    }
    const result = await response.json();
    return { error: false, message: result.message, article: result.data };
  } catch (error) {
    return { error: true, message: error.message, article: null };
  }
};

const createArticle = async (formData) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/psikolog/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to create article");
    }

    const result = await response.json();
    return { error: false, message: result.message, data: result.data };
  } catch (error) {
    return { error: true, message: error.message, data: null };
  }
};

const editArticle = async (formData, articleId) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/psikolog/articles/${articleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to update article");
    }

    const result = await response.json();
    return { error: false, message: result.message, data: result.data };
  } catch (error) {
    return { error: true, message: error.message, data: null };
  }
};

const deleteArticle = async (articleId) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/psikolog/articles/${articleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete article");
    }

    const result = await response.json();
    return { error: false, message: result.message };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const getAllUsers = async () => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/admin/users/all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get all users");
    }

    const result = await response.json();
    return { error: false, message: result.message, users: result.data };
  } catch (error) {
    return { error: true, message: error.message, users: null };
  }
};

const deleteUserById = async (userId) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    const result = await response.json();
    return { error: false, message: result.message };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const createUser = async (dataUser) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dataUser),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const result = await response.json();
    return { error: false, message: result.message };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const getUserById = async (idUser) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/admin/users/${idUser}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    const result = await response.json();
    return { error: false, message: result.message, user: result.data };
  } catch (error) {
    return { error: true, message: error.message, user: null };
  }
};

const AdminUpdateUser = async (data, idUser) => {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${CONFIG.BASE_URL}/admin/users/${idUser}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    return { error: false, message: result.message, user: result.data };
  } catch (error) {
    return { error: true, message: error.message, user: null };
  }
};

export {
  updateProfile,
  getAllPsikolog,
  getPsikologById,
  updateProfilePsikolog,
  getArticles,
  getArticlesByWriter,
  createArticle,
  deleteArticle,
  getArticleBySlug,
  editArticle,
  getAllUsers,
  deleteUserById,
  createUser,
  getUserById,
  AdminUpdateUser,
};
