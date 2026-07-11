import { useState } from 'react';
import { useNavigate } from '../router';
import { register } from '../api/userApi';

export default function Register() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try { await register(nickname, password); setMessage('회원가입이 완료되었습니다.'); setTimeout(() => navigate('/login'), 700); }
    catch (err) { setError(err.message === '이미 존재하는 닉네임입니다.' ? err.message : '회원가입에 실패했습니다.'); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">JOIN MALLANG</p><h1>말랑이 회원가입</h1><p>나만의 말랑이 취향을 기록해 보세요.</p><form onSubmit={submit}><label>닉네임<input value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="username" required /></label><label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></label>{error && <div className="auth-error">{error}</div>}{message && <div className="auth-success">{message}</div>}<button className="primary full" disabled={loading}>{loading ? '가입 중...' : '회원가입'}</button></form><button className="auth-link" onClick={() => navigate('/login')}>이미 회원이신가요? <b>로그인</b></button></section></main>;
}
