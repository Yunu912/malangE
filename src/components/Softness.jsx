export default function Softness({ value }) {
  return <span className="softness">{'★'.repeat(value)}<em>{'★'.repeat(5 - value)}</em></span>;
}
