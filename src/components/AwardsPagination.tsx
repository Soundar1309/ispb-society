import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AwardsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Page numbers with ellipsis, e.g. 1 … 4 5 6 … 12
const getPages = (page: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
};

const AwardsPagination = ({ page, totalPages, totalItems, pageSize, onPageChange }: AwardsPaginationProps) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const base =
    'h-9 min-w-[2.25rem] px-2 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors';

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8"
      aria-label="Awards pagination"
    >
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {totalItems}
      </p>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${base} border border-gray-200 text-gray-700 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPages(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${base} ${
                p === page
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-700 hover:bg-green-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${base} border border-gray-200 text-gray-700 hover:bg-green-50 disabled:opacity-40 disabled:hover:bg-transparent`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

export default AwardsPagination;
