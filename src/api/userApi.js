import { API_URL } from './tradeApi';

async function request(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail ?? '요청 처리에 실패했습니다.');
  return data;
}

export const register = (nickname, password) => request('/user/register', { nickname, password });
export const login = (nickname, password) => request('/user/login', { nickname, password });
