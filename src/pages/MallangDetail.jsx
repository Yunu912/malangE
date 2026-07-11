import { useEffect, useState } from 'react';
import { Link, useParams } from '../router';
import { getMallangById } from '../api/mallangApi';
import Softness from '../components/Softness';
import ToyArt from '../components/ToyArt';

export default function MallangDetail() {
  const [mallang, setMallang] = useState(); const { id } = useParams();
  useEffect(() => { getMallangById(id).then(setMallang); }, [id]);
  if (!mallang) return <main>말랑이 정보를 불러오는 중이에요.</main>;
  return <main className="detail"><Link className="back" to="/">← 목록으로</Link><div className="detail-layout"><ToyArt mallang={mallang} large /><div className="detail-copy"><span className="tag">{mallang.category}</span><h1>{mallang.name}</h1><p className="soft-line">말랑도 <Softness value={mallang.softness} /></p><p>{mallang.description || mallang.review || '등록된 리뷰가 없어요.'}</p><dl><div><dt>가격</dt><dd>{mallang.price?.toLocaleString()}원</dd></div>{mallang.shop && <div><dt>구매처</dt><dd>{mallang.shop}</dd></div>}{mallang.sound && <div><dt>소리</dt><dd>{mallang.sound}</dd></div>}{mallang.review && <div><dt>리뷰</dt><dd>{mallang.review}</dd></div>}</dl></div></div></main>;
}
