export function Skeleton({ className = "h-4 w-full" }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-44 w-full mb-4" />
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-5 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-4" />
      <Skeleton className="h-9 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="card flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-10 w-10 rounded-lg mb-3" />
      <Skeleton className="h-7 w-16 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Skeleton className="h-9 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card"><Skeleton className="h-5 w-40 mb-4" /><ListSkeleton rows={3} /></div>
        <div className="card"><Skeleton className="h-5 w-40 mb-4" /><ListSkeleton rows={3} /></div>
      </div>
    </div>
  );
}
