export default function ComingSoon({ title, description }) {
  return (
    <div className="admin-page">
      <h1>{title}</h1>
      <div className="admin-empty">
        <p>{description}</p>
      </div>
    </div>
  );
}
