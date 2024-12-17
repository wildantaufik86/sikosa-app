import { getAccessToken } from "./utils";

const BASE_URL = "http://localhost:5000";

const updateProfile = async (formData) => {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("Invalid accessToken");
    }
    const response = await fetch(`${BASE_URL}/user/profile`, {
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

const getPsikologById = async (psikologId) => {
  try {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error("Invalid access token");
    }
    const response = await fetch(`${BASE_URL}/user/psikolog/${psikologId}`, {
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
export { updateProfile, getPsikologById };
