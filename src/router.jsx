import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext({ path: '/', navigate: () => {} });

export function BrowserRouter({ children }) {
  const [path, setPath] = useState(() => `${window.location.pathname}${window.location.search}`);
  useEffect(() => { const update = () => setPath(`${window.location.pathname}${window.location.search}`); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  const value = useMemo(() => ({ path, navigate: (to) => { window.history.pushState({}, '', to); setPath(to); } }), [path]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Link({ to, children, ...props }) { const { navigate } = useContext(RouterContext); return <a href={to} onClick={(event) => { event.preventDefault(); navigate(to); }} {...props}>{children}</a>; }
export function NavLink({ to, end, className, children }) { const { path } = useContext(RouterContext); const active = end ? path.split('?')[0] === to : path.startsWith(to); return <Link to={to} className={`${className ?? ''} ${active ? 'active' : ''}`.trim()}>{children}</Link>; }
export function useNavigate() { return useContext(RouterContext).navigate; }
export function useSearchParams() { const { path, navigate } = useContext(RouterContext); return [new URLSearchParams(path.split('?')[1] ?? ''), navigate]; }
export function useParams() { const { path } = useContext(RouterContext); return { id: path.split('?')[0].split('/').filter(Boolean).at(-1) }; }
export function Route() { return null; }
export function Routes({ children }) { const { path } = useContext(RouterContext); const pathname = path.split('?')[0]; const route = children.find((child) => { const pattern = child.props.path; if (pattern === pathname) return true; if (!pattern.includes(':')) return false; return new RegExp(`^${pattern.replace(/:[^/]+/g, '[^/]+')}$`).test(pathname); }); return route?.props.element ?? <main>페이지를 찾을 수 없어요.</main>; }
