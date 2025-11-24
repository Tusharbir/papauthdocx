import React from 'react';

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;


  const handleFirst = () => {
    if (page !== 1) onPageChange(1);
  };
  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };
  const handleLast = () => {
    if (page !== totalPages) onPageChange(totalPages);
  };

  // Show up to 5 page numbers
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(5, totalPages);
      if (end === totalPages) start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
        onClick={handleFirst}
        disabled={page === 1}
      >
        First
      </button>
      <button
        className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
        onClick={handlePrev}
        disabled={page === 1}
      >
        Prev
      </button>
      {getPageNumbers().map((num) => (
        <button
          key={num}
          className={`px-3 py-1 rounded ${num === page ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
        onClick={handleNext}
        disabled={page === totalPages}
      >
        Next
      </button>
      <button
        className="px-3 py-1 rounded bg-slate-700 text-white disabled:opacity-50"
        onClick={handleLast}
        disabled={page === totalPages}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
