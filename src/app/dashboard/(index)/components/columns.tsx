"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

// Hiyerarşi için children alanını ekleme
export type RowUser = User & {
  managerId: number | null;
  children?: RowUser[];
};

const INDENT_PX = 16;


const usersColumns = (
  onEdit: (u: RowUser) => void,
  onDelete?: (u: RowUser) => void
): ColumnDef<RowUser, unknown>[] => [
  {
    id: "expander",
    header: "",
    size: 32,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          className="px-1 text-muted-foreground hover:text-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
          title={row.getIsExpanded() ? "Collapse" : "Expand"}
        >
          {row.getIsExpanded() ? "▾" : "▸"}
        </button>
      ) : null,
  },

  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div
          className="flex flex-col"
          style={{ paddingLeft: row.depth * INDENT_PX }}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{u.fullName}</span>
            {row.getCanExpand() && (
              <span className="rounded bg-muted px-2 py-[2px] text-[11px]">
                {(u.children?.length ?? 0).toString()}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{u.email}</span>
        </div>
      );
    },
  },

  { accessorKey: "role", header: "Role" },

  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className="rounded-md bg-muted px-3 py-1 text-xs">
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-3">
          <button
            className="rounded p-2 text-foreground hover:bg-muted"
            onClick={() => onEdit(u)}
            aria-label="Edit"
            title="Edit"
          >
            <Pencil className="size-4" />
          </button>
          <button
            className="rounded p-2 text-red-500 hover:bg-red-50"
            onClick={() => onDelete?.(u)}  
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      );
    },
  }
];

export default usersColumns;

