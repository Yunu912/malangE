import { Link } from '../router';
import ToyArt from './ToyArt';
import Softness from './Softness';

export default function MallangCard({ mallang }) {
  return <Link className="toy-card" to={`/mallangs/${mallang.id}`} aria-label={`${mallang.name} 상세 보기`}>
    <ToyArt mallang={mallang} />
    <div className="card-copy"><span className="tag">{mallang.category}</span><h3>{mallang.name}</h3><p>말랑도 <Softness value={mallang.softness} /></p></div>
  </Link>;
}
