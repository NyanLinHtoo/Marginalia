export default function Loading() {
  return (
    <div>
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="mt-8 border-t border-border">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border py-5">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="mt-2 h-3 w-64 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
