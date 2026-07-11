export default function ToyArt({ mallang, large = false }) {
  return <div className={`toy-art ${large ? 'large' : ''}`} style={{ '--toy': mallang.color ?? '#ffd4dc' }}>{mallang.image ? <img src={mallang.image} alt={mallang.name} /> : <span>{mallang.emoji ?? '♡'}</span>}<i /></div>;
}
