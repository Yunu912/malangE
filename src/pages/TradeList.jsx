import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '../router';
import { createTrade, getTrades, requestTrade } from '../api/tradeApi';
import TradeRequestModal from '../components/TradeRequestModal';
import TradeWriteModal from '../components/TradeWriteModal';
import TradeCard from '../components/TradeCard';

const filters = ['전체', '모집중', '거래중', '거래완료'];

export default function TradeList() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('전체');
  const [query, setQuery] = useState('');
  const [requestedTrade, setRequestedTrade] = useState(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getTrades().then(setTrades); }, []);

  const visibleTrades = useMemo(() => trades.filter((trade) => {
    const matchesFilter = filter === '전체' || trade.status === filter;
    const text = `${trade.mallang.name} ${trade.wanted} ${trade.location}`;
    return matchesFilter && text.includes(query);
  }), [trades, filter, query]);

  return <main className="board">
    <div className="board-head"><div><p className="eyebrow">MALLANG EXCHANGE</p><h1>교환 게시판</h1><p>새로운 말랑이 친구를 만나 보세요.</p></div><button className="primary" type="button" onClick={() => setIsWriteOpen(true)}>+ 교환 글 쓰기</button></div>
    <label className="trade-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="내가 원하는 말랑이를 검색하세요" /></label>
    <div className="filters">{filters.map((item) => <button className={filter === item ? 'selected' : ''} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="trade-list">{visibleTrades.map((trade) => <TradeCard key={trade.id} trade={trade} onRequest={setRequestedTrade} />)}</div>
    {visibleTrades.length === 0 && <p className="trade-empty">조건에 맞는 교환 글이 없어요.</p>}
    {error && <p className="trade-error">{error}</p>}
    <TradeRequestModal trade={requestedTrade} onClose={() => setRequestedTrade(null)} onStartChat={async () => { try { const room = await requestTrade(requestedTrade.id, localStorage.getItem('userId')); navigate(`/chat/${room.id}`); } catch (err) { setError(err.message); } finally { setRequestedTrade(null); } }} />
    {isWriteOpen && <TradeWriteModal onClose={() => setIsWriteOpen(false)} onSubmit={async (payload) => { try { const trade = await createTrade({ ...payload, user_id: localStorage.getItem('userId'), writer: localStorage.getItem('nickname') }); setTrades((items) => [trade, ...items]); setIsWriteOpen(false); } catch (err) { setError(err.message); } }} />}
  </main>;
}
