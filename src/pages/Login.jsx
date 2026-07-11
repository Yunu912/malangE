import { useState } from 'react';
import { useNavigate } from '../router';
import { login } from '../api/userApi';

export default function Login() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(nickname, password);
      localStorage.setItem('userId', String(user.id));
      localStorage.setItem('nickname', user.nickname);
      window.dispatchEvent(new Event('authchange'));
      navigate('/');
    } catch (err) { setError(err.message === '닉네임 또는 비밀번호가 올바르지 않습니다.' ? err.message : '닉네임 또는 비밀번호가 올바르지 않습니다.'); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>말랑이에 로그인</h1><p>좋아하는 말랑이를 만나러 가 볼까요?</p><form onSubmit={submit}><label>닉네임<input value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="username" required /></label><label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <div className="auth-error">{error}</div>}<button className="primary full" disabled={loading}>{loading ? '로그인 중...' : '로그인'}</button></form><button className="auth-link" onClick={() => navigate('/register')}>아직 회원이 아니신가요? <b>회원가입</b></button></section></main>;
}
