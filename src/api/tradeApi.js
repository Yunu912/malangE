import { getMallangs } from './mallangApi';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const apiImage = (path) => path ? `${API_URL}${path}` : '';
const mapTrade = (trade) => ({ id: trade.id, mallang: { id: trade.id, name: trade.mallang_name, category: trade.category, location: trade.location, image: apiImage(trade.image_path), color: '#ffd4dc', emoji: '♡', softness: 3, price: 0 }, wanted: trade.wanted_mallang, description: trade.description, location: trade.location, writer: trade.writer, createdAt: new Date(trade.created_at).toLocaleString('ko-KR'), status: trade.status, raw: trade });

export async function getTrades() {
  try { const response = await fetch(`${API_URL}/trade`); if (!response.ok) throw new Error(); return (await response.json()).map(mapTrade); }
  catch { const mallangs = await getMallangs(); return [{ id: 1, mallang: mallangs[0], wanted: '구름 푸딩 말랑이', location: '홍대입구역 근처', writer: '딸기우유', createdAt: '12분 전', status: '모집중' }, { id: 2, mallang: mallangs[4], wanted: '과일 모양 말랑이', location: '잠실역 근처', writer: '몽글몽글', createdAt: '1시간 전', status: '거래중' }]; }
}

export async function createTrade(payload) { const body = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') body.append(key, value); }); const response = await fetch(`${API_URL}/trade`, { method: 'POST', body }); if (!response.ok) throw new Error('교환 글 저장에 실패했습니다. 서버가 실행 중인지 확인해 주세요.'); return mapTrade(await response.json()); }
export async function getTrade(id) { const response = await fetch(`${API_URL}/trade/${id}`); if (!response.ok) throw new Error('교환 글을 불러오지 못했습니다.'); return mapTrade(await response.json()); }
export async function getMyTrades(userId) { const response = await fetch(`${API_URL}/user/${userId}/trades`); if (!response.ok) throw new Error('내 교환 글을 불러오지 못했습니다.'); return (await response.json()).map(mapTrade); }
export async function updateTrade(id, payload) { const body = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') body.append(key, value); }); const response = await fetch(`${API_URL}/trade/${id}`, { method: 'PUT', body }); if (!response.ok) throw new Error('게시글 수정에 실패했습니다.'); return mapTrade(await response.json()); }
export async function deleteTrade(id, userId) { const response = await fetch(`${API_URL}/trade/${id}?user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' }); if (!response.ok) throw new Error('게시글 삭제에 실패했습니다.'); }
export async function requestTrade(id, buyerId) { const response = await fetch(`${API_URL}/trade/${id}/request?buyer_id=${encodeURIComponent(buyerId)}`, { method: 'POST' }); if (!response.ok) throw new Error('채팅방 생성에 실패했습니다.'); return response.json(); }
export async function getMessages(roomId) { const response = await fetch(`${API_URL}/chat/${roomId}`); if (!response.ok) throw new Error('대화를 불러오지 못했습니다.'); return response.json(); }
export async function sendMessage(roomId, message, senderId) { const response = await fetch(`${API_URL}/chat/${roomId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender_id: Number(senderId), message }) }); if (!response.ok) throw new Error('메시지 전송에 실패했습니다.'); return response.json(); }
export async function getChatRooms(userId) { const response = await fetch(`${API_URL}/chat/rooms/${userId}`); if (!response.ok) throw new Error('채팅 목록을 불러오지 못했습니다.'); return response.json(); }
