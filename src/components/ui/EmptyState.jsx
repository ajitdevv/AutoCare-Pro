import Link from "next/link";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }) {
  return (
    <div className="card p-12 text-center animate-fade-in">
      {Icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
