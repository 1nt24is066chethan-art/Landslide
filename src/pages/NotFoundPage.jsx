import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="panel p-10 flex flex-col items-center text-center gap-3 min-h-[50vh] justify-center">
      <h2 className="text-lg font-semibold text-slate-100">Page not found</h2>
      <p className="text-sm text-slate-400 max-w-md">
        The page you're looking for doesn't exist in this prototype.
      </p>
      <Link
        to="/"
        className="mt-2 text-sm font-medium text-accent-soft hover:underline"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}
