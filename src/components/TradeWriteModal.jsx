import { useState } from 'react';

export default function TradeWriteModal({ onClose, onSubmit }) {
  const [mallangName, setMallangName] = useState(''); const [category, setCategory] = useState('기타'); const [description, setDescription] = useState('');
  const [wanted, setWanted] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('채팅');
  const [image, setImage] = useState(''); const [imageFile, setImageFile] = useState(null);
  const selectImage = (event) => { const [file] = event.target.files; if (!file) return; setImageFile(file); const reader = new FileReader(); reader.onload = () => setImage(reader.result); reader.readAsDataURL(file); };
  const submit = async (event) => { event.preventDefault(); if (!mallangName.trim() || !wanted.trim() || !location.trim()) return; await onSubmit({ mallang_name: mallangName.trim(), category, wanted_mallang: wanted, description, location, writer: '몽글이', image: imageFile }); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal write-modal" role="dialog" aria-modal="true" aria-label="교환 글 쓰기" onMouseDown={(event) => event.stopPropagation()}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">×</button><p className="eyebrow">NEW EXCHANGE POST</p><h2>교환 글 쓰기</h2><p className="modal-description">교환 정보를 등록하고 원하는 친구에게 문의를 받아보세요.</p>
    <form onSubmit={submit}><label>교환할 말랑이 등록<input value={mallangName} onChange={(event) => setMallangName(event.target.value)} placeholder="예: 내가 가진 딸기 말랑이" required /></label><label>말랑이 종류<select value={category} onChange={(event) => setCategory(event.target.value)}><option>크런치</option><option>왁뿌볼</option><option>말랑이</option><option>기타</option></select></label><label>사진 첨부<input className="file-input" type="file" accept="image/*" onChange={selectImage} /><small>사진을 선택하면 교환 상품 이미지로 표시됩니다.</small></label>{image && <img className="upload-preview" src={image} alt="첨부한 말랑이 미리보기" />}<label>원하는 말랑이 설정<input value={wanted} onChange={(event) => setWanted(event.target.value)} placeholder="예: 구름 푸딩 말랑이" required /></label><label>설명<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="말랑이의 상태나 교환 조건을 적어 주세요." /></label><label>교환 희망 지역 표시<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="예: 홍대입구역 근처" required /></label><fieldset><legend>교환 문의 방법</legend><label><input type="radio" name="contact" checked={contact === '채팅'} onChange={() => setContact('채팅')} /> 채팅을 통한 문의</label><label><input type="radio" name="contact" checked={contact === '댓글'} onChange={() => setContact('댓글')} /> 댓글을 통한 문의</label></fieldset><button className="primary full" type="submit">교환 글 등록하기</button></form>
  </section></div>;
}
