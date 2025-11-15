import api from "../utils/api";

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getUserProfile() {
  const response = await api.get("/users/profile");
  return response.data;
}

export async function updateUserProfile(userData) {
  const response = await api.put("/users/profile", userData);
  return response.data;
}

export async function uploadCover(file) {
  const formData = new FormData();
  formData.append("cover", file);

  const response = await api.post("/users/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
