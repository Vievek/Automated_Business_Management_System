const customFetch = async (url, options = {}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, { ...defaultOptions, ...options });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      // Clear invalid auth state
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    throw error;
  }
};

export default customFetch;
