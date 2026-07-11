const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const mallangs = [
  { id: 1, name: '딸기 밀크 말랑이', category: '음식', softness: 5, price: 12000, location: '서울 마포구 모모 문구', description: '우유가 가득 든 딸기 모양 말랑이예요. 향긋하고 쫀득한 촉감이 매력적이에요.', shop: '모모 문구', color: '#ffb7be', emoji: '🍓' },
  { id: 2, name: '구름 푸딩 말랑이', category: '캐릭터', softness: 4, price: 9800, location: '서울 성북구 토이랜드', description: '폭신폭신한 구름 푸딩. 책상 위 작은 휴식 친구예요.', shop: '토이랜드', color: '#b9d9ff', emoji: '☁️' },
  { id: 3, name: '레몬 케이크 말랑이', category: '음식', softness: 3, price: 10500, location: '서울 강남구 해피샵', description: '보송한 케이크 질감과 상큼한 레몬 색감이 돋보여요.', shop: '해피샵', color: '#ffe477', emoji: '🍋' },
  { id: 4, name: '복숭아 찹쌀떡', category: '음식', softness: 5, price: 11000, location: '경기 성남시 모모 문구', description: '말랑하게 늘어나는 복숭아 찹쌀떡 모양 친구예요.', shop: '모모 문구', color: '#ffc4cf', emoji: '🍑' },
  { id: 5, name: '초코 도넛 말랑이', category: '음식', softness: 4, price: 12500, location: '서울 송파구 베어토이', description: '달콤한 초코 토핑을 닮은 동글동글 도넛 말랑이예요.', shop: '베어토이', color: '#cf9a7b', emoji: '🍩' },
  { id: 6, name: '별빛 젤리 말랑이', category: '캐릭터', softness: 3, price: 9000, location: '인천 부평구 토이랜드', description: '투명하게 반짝이는 별 모양 젤리 말랑이입니다.', shop: '토이랜드', color: '#c9b7ff', emoji: '⭐' },
];

const mapMallang = (mallang) => ({ id: `db-${mallang.id}`, name: mallang.name, category: mallang.category, softness: mallang.softness, sound: mallang.sound, review: mallang.review, shop: mallang.shop, price: mallang.price, image: mallang.image_path ? `${API_URL}${mallang.image_path}` : '', color: '#ffd4dc', emoji: '♡', description: mallang.review });
export const getMallangs = async () => { try { const response = await fetch(`${API_URL}/mallang`); if (!response.ok) throw new Error(); return [...(await response.json()).map(mapMallang), ...mallangs]; } catch { return mallangs; } };
export const getMallangById = async (id) => { if (String(id).startsWith('db-')) { const response = await fetch(`${API_URL}/mallang/${String(id).replace('db-', '')}`); if (!response.ok) return undefined; return mapMallang(await response.json()); } return mallangs.find((mallang) => mallang.id === Number(id)); };
export const createMallang = async (payload) => { const body = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') body.append(key, value); }); const response = await fetch(`${API_URL}/mallang`, { method: 'POST', body }); if (!response.ok) throw new Error('신규 말랑이 저장에 실패했습니다.'); return mapMallang(await response.json()); };
