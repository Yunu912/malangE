import { useEffect, useState } from 'react';
import { useSearchParams } from '../router';
import { createMallang, getMallangs } from '../api/mallangApi';
import MallangCard from '../components/MallangCard';
import NewMallangModal from '../components/NewMallangModal';

export default function Home() {
  const [mallangs, setMallangs] = useState([]); const [isNewOpen, setIsNewOpen] = useState(false); const [error, setError] = useState(''); const [params] = useSearchParams(); const query = params.get('q') ?? ''; const nickname = localStorage.getItem('nickname');
  useEffect(() => { getMallangs().then(setMallangs); }, []);
  const visible = mallangs.filter(({ name, category }) => `${name}${category}`.includes(query));
  return <><section className="hero"><div><p className="eyebrow">내가 좋아하는 말랑이, 더 즐겁게</p><h1>안녕하세요, {nickname}님!<br />말랑한 취향을<br />한눈에 찾아요 <span>♡</span></h1><p>나만의 말랑이를 발견하고, 마음이 맞는 친구와 교환해 보세요.</p></div><div className="hero-toys"><div className="bubble b1">🍓</div><div className="bubble b2">☁️</div><div className="bubble b3">🍩</div></div></section><main><div className="section-title"><div><p className="eyebrow">MALLANG COLLECTION</p><h2>말랑이 종류 및 목록</h2></div><div className="collection-actions"><span className="result-count">{visible.length}개</span><button className="new-mallang" onClick={() => setIsNewOpen(true)}>+ 신규</button></div></div>{error && <p className="trade-error">{error}</p>}<div className="category-row"><span>전체</span><span>음식</span><span>캐릭터</span></div><div className="toy-grid">{visible.map((mallang) => <MallangCard key={mallang.id} mallang={mallang} />)}</div></main>{isNewOpen && <NewMallangModal onClose={() => setIsNewOpen(false)} onCreate={async (payload) => { try { const mallang = await createMallang(payload); setMallangs((items) => [mallang, ...items]); setIsNewOpen(false); } catch (err) { setError(err.message); } }} />}</>;
}
