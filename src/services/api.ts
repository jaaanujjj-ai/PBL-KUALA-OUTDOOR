export const API_BASE_URL = "http://localhost/PBL-KELANA-OUTDOOR/api";

export const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || "API request failed");
  }
  
  return data;
};

export const apiGet = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleApiResponse(response);
  } catch (error: any) {
    console.error("API GET Error:", error);
    throw error;
  }
};

export const apiPost = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error("API POST Error:", error);
    throw error;
  }
};

export const apiDelete = async (endpoint: string, body?: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleApiResponse(response);
  } catch (error: any) {
    console.error("API DELETE Error:", error);
    throw error;
  }
};

export const apiUpload = async (endpoint: string, formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  return handleApiResponse(response);
};