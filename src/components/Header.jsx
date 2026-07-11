import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from '../router';

export default function Header() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(() => localStorage.getItem('nickname'));
  useEffect(() => { const sync = () => setNickname(localStorage.getItem('nickname')); window.addEventListener('authchange', sync); window.addEventListener('storage', sync); return () => { window.removeEventListener('authchange', sync); window.removeEventListener('storage', sync); }; }, []);
  const search = (event) => { if (event.key === 'Enter') navigate(`/?q=${encodeURIComponent(event.currentTarget.value)}`); };
  const logout = () => { localStorage.removeItem('userId'); localStorage.removeItem('nickname'); window.dispatchEvent(new Event('authchange')); navigate('/login'); };
  return <header><Link className="brand" to="/"><span>●</span> 말랑만남</Link>{nickname && <nav><NavLink to="/" end>홈</NavLink><NavLink to="/trades">교환 게시판</NavLink><NavLink to="/chats">교환 채팅</NavLink><NavLink to="/mypage">마이페이지</NavLink></nav>}{nickname && <label className="search"><span>⌕</span><input onKeyDown={search} placeholder="어떤 말랑이를 찾나요?" /></label>}<div className="auth-nav">{nickname ? <><Link className="user-name" to="/mypage">{nickname}</Link><button className="logout" onClick={logout}>로그아웃</button></> : <><Link to="/login">로그인</Link><Link className="join-link" to="/register">회원가입</Link></>}</div></header>;
}
