export const TOKEN_KEY = "petagenda_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem("petagenda.token");
}

export function setToken(token, remember = true) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem("petagenda.token", token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem("petagenda.token");
}

let onUnauthorizedCallback = null;

export function setOnUnauthorizedCallback(cb) {
  onUnauthorizedCallback = cb;
}

export async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const token = getToken();
  const reqHeaders = {
    ...headers,
  };

  if (auth && token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      reqHeaders["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(path, options);
  } catch (err) {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }

  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      removeToken();
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Processamento de detalhes de erro Zod ou mensagem customizada
    const details = data?.error?.details
      ? data.error.details.map((item) => `${item.field || "Campo"}: ${item.message}`).join("; ")
      : null;
    const validation = Array.isArray(data?.errors)
      ? data.errors.map((item) => item.message).join("; ")
      : null;
    const message =
      details ||
      validation ||
      data?.error?.message ||
      data?.message ||
      `Erro na requisição (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data?.data !== undefined ? data.data : data;
}

// Sub-APIs
export const authApi = {
  login: (credentials) =>
    request("/api/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    }),
  forgotPassword: (email) =>
    request("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  resetPassword: (payload) =>
    request("/api/auth/reset-password", {
      method: "POST",
      body: payload,
      auth: false,
    }),
};

export const tutorApi = {
  register: (data) =>
    request("/api/tutores", {
      method: "POST",
      body: data,
      auth: false,
    }),
  getMe: () => request("/api/tutores/me"),
  updateMe: (data) =>
    request("/api/tutores/me", {
      method: "PUT",
      body: data,
    }),
};

export const petsApi = {
  list: () => request("/api/pets"),
  getById: (id) => request(`/api/pets/${id}`),
  create: (pet) =>
    request("/api/pets", {
      method: "POST",
      body: pet,
    }),
  update: (id, pet) =>
    request(`/api/pets/${id}`, {
      method: "PUT",
      body: pet,
    }),
  delete: (id) =>
    request(`/api/pets/${id}`, {
      method: "DELETE",
    }),
};

export const agendaApi = {
  list: (petId) => {
    const query = petId ? `?petId=${encodeURIComponent(petId)}` : "";
    return request(`/api/agenda${query}`);
  },
  getById: (id) => request(`/api/agenda/${id}`),
  create: (evento) =>
    request("/api/agenda", {
      method: "POST",
      body: evento,
    }),
  update: (id, evento) =>
    request(`/api/agenda/${id}`, {
      method: "PUT",
      body: evento,
    }),
  delete: (id) =>
    request(`/api/agenda/${id}`, {
      method: "DELETE",
    }),
};

export const clinicasApi = {
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.busca) searchParams.set("busca", params.busca);
    if (params.cidade) searchParams.set("cidade", params.cidade);
    if (params.estado) searchParams.set("estado", params.estado);
    if (params.servico) searchParams.set("servico", params.servico);
    const queryString = searchParams.toString();
    return request(`/api/clinicas${queryString ? `?${queryString}` : ""}`, {
      auth: false,
    });
  },
  getById: (id) => request(`/api/clinicas/${id}`, { auth: false }),
  create: (data) =>
    request("/api/clinicas", {
      method: "POST",
      body: data,
    }),
  update: (id, data) =>
    request(`/api/clinicas/${id}`, {
      method: "PUT",
      body: data,
    }),
  delete: (id) =>
    request(`/api/clinicas/${id}`, {
      method: "DELETE",
    }),
};
