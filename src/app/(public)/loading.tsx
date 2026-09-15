export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="h-4 w-80 rounded bg-muted" />
      <div className="mt-8 h-[42px] rounded-md bg-muted" />

      <div className="mt-10 border-t border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-b border-border py-8">
            <div className="h-3 w-40 rounded bg-muted" />
            <div className="mt-3 h-7 w-3/4 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
