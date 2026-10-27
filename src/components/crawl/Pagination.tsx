export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  return (
    <div className="pagination">
      <span>Page {page + 1} of {totalPages}</span>
      <div>
        <button className="button button-quiet" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="button button-quiet" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
