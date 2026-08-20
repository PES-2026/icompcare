import TablePagination from "@/components/ui/TablePagination";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

export interface Column<T> {
  label: string;
  width?: string;
  renderFilter?: () => ReactNode;
  renderCell: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  headerAction?: ReactNode;
  toolbar?: ReactNode;
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loadingComponent?: ReactNode;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalItems: number;
  totalPages?: number;
}

export function DataTable<T>({
  title,
  headerAction,
  toolbar,
  columns,
  data,
  isLoading = false,
  loadingComponent,
  emptyMessage = "Nenhum registro encontrado.",
  emptyComponent,
  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages,
}: DataTableProps<T>) {
  return (
    <main className="flex min-w-0 flex-1 flex-col h-full font-sans p-6">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-[#faf7f0] border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)] min-h-0">
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-xl font-semibold text-[#3a3530]">{title}</h1>
            {isLoading && (
              <Loader2 className="animate-spin text-teal-600" size={18} />
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
        {toolbar && (
          <div className="shrink-0 border-t border-[#ece7db] px-6 py-4">
            {toolbar}
          </div>
        )}

        {isLoading && loadingComponent ? (
          <div className="flex-1 overflow-auto">{loadingComponent}</div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className={`whitespace-nowrap border-y border-[#ece7db] bg-[#faf7f0] px-4 py-3 text-center font-bold text-[#4a4540] ${col.width || ""}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>

                  {columns.some((col) => col.renderFilter) && (
                    <tr>
                      {columns.map((col, index) => (
                        <td
                          key={`filter-${index}`}
                          className="border-b border-[#ece7db] bg-[#faf7f0] px-4 py-2"
                        >
                          {col.renderFilter ? col.renderFilter() : null}
                        </td>
                      ))}
                    </tr>
                  )}
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-16 text-center text-[#6a6560]"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2
                            size={32}
                            className="animate-spin text-teal-600"
                          />
                          <span className="text-sm font-medium text-stone-500">
                            Carregando dados...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-8 text-center text-[#a0a0a0]"
                      >
                        {emptyComponent ?? emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    data.map((item, rowIdx) => {
                      const isLast = rowIdx === data.length - 1;
                      const borderClass = isLast
                        ? ""
                        : "border-b border-[#f0ebe0]";

                      return (
                        <tr
                          key={rowIdx}
                          className="transition-colors duration-150 bg-white hover:bg-[#fcfcfc]"
                        >
                          {columns.map((col, colIdx) => (
                            <td
                              key={colIdx}
                              className={`px-4 py-3.5 text-center text-[#6a6560] ${borderClass}`}
                            >
                              {col.renderCell(item)}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              lengthData={totalItems}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </main>
  );
}
