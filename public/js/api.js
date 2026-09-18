export const sessionKey = 'petagenda.token';
export async function api(path, { method = 'GET', body, authenticated = true } = {}) {
  const token = sessionStorage.getItem(sessionKey);
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      sessionStorage.removeItem(sessionKey);
      location.replace('/?login=1');
    }
    const details = data?.error?.details?.map(item => item.field + ': ' + item.message).join('; ');
    const validation = data?.errors?.map(item => item.message).join('; ');
    throw new Error(details || validation || data?.message || data?.error?.message || 'Não foi possível concluir.');
  }
  return data?.data ?? data;
}
export function message(text, error = false) {
  const element = document.getElementById('message');
  element.textContent = text;
  element.dataset.error = String(error);
}
