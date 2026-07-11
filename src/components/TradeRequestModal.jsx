import ToyArt from './ToyArt';

export default function TradeRequestModal({ trade, onClose, onStartChat }) {
  if (!trade) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal request-modal" role="dialog" aria-modal="true" aria-label="교환 요청" onMouseDown={(event) => event.stopPropagation()}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">×</button>
    <p className="eyebrow">EXCHANGE REQUEST</p><h2>교환할 말랑이를 확인해 주세요</h2>
    <div className="request-mallang"><ToyArt mallang={trade.mallang} /><div><span className="tag">{trade.mallang.category}</span><h3>{trade.mallang.name}</h3><p>말랑도 {'★'.repeat(trade.mallang.softness)}{'☆'.repeat(5 - trade.mallang.softness)}</p><p>{trade.mallang.price ? `${trade.mallang.price.toLocaleString()}원 · ` : ''}{trade.mallang.location}</p></div></div>
    <div className="exchange-summary"><span>원하는 말랑이</span><strong>{trade.wanted}</strong><span>희망 거래 장소</span><strong>{trade.location}</strong><span>작성자</span><strong>{trade.writer}</strong></div>
    <p className="modal-note">정보를 확인한 뒤 채팅으로 교환을 문의해 보세요.</p>
    <div className="modal-actions"><button className="secondary" type="button" onClick={onClose}>닫기</button><button className="primary" type="button" onClick={onStartChat}>채팅 시작 →</button></div>
  </section></div>;
}
