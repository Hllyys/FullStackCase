"use client";

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { RowUser } from "./columns";

type Props = {
  columns: ColumnDef<RowUser, unknown>[];
  data: RowUser[];
  pagination: { page: number; totalPages: number; totalItems: number };
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onSortingChange: (sorting: SortingState) => void;
  sorting: SortingState;
  pageSize?: number;
  hideFooterAdd?: boolean;
};

export default function CommentsDataTable({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSortingChange,
  sorting,
  pageSize = 20,
  hideFooterAdd = true, 
}: Props) {
  const start = pagination.totalItems
    ? (pagination.page - 1) * pageSize + 1
    : 0;
  const end = pagination.totalItems
    ? Math.min(pagination.page * pageSize, pagination.totalItems)
    : 0;

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        getSubRows={(row) =>
          (row as RowUser & { children?: RowUser[] }).children
        }
        manualPagination
        pageCount={pagination.totalPages}
        pageIndex={pagination.page - 1}
        onPaginationChange={onPaginationChange}
        manualSorting
        onSortingChange={onSortingChange}
        sorting={sorting}
        total={pagination.totalItems}
        {...({ showAddFooter: false} as any)}
      />

      <div className="mt-2 text-xs text-muted-foreground">
        Showing {start}-{end} from {pagination.totalItems} data
      </div>
    </>
  );
}
