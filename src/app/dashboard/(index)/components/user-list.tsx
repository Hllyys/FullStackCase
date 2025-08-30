"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  RefreshCwIcon,
  Search,
  SearchIcon,
  PlusCircleIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortingState } from "@tanstack/react-table";

import CommentsDataTable from "./data-table";
import usersColumns, { RowUser } from "./columns";
import AddUserModal from "./add-user-modal";
import EditUserModal from "./edit-user-modal";

import {
  apiListUsers,
  apiGetUser,
  apiDeleteUser,
} from "@/app/apihelper";


type ApiUser = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  managerId: number | null;
  createdAt: string;
};

/* roleId -> tablo rol metni */
const ROLE_MAP: Record<number, "admin" | "manager" | "staff"> = {
  1: "admin",
  2: "manager",
  3: "staff",
};


function toRowUsers(items: ApiUser[]): RowUser[] {
  const childrenOf: Record<number, ApiUser[]> = {};
  const roots: ApiUser[] = [];

  for (const u of items) {
    if (u.managerId) (childrenOf[u.managerId] ||= []).push(u);
    else roots.push(u);
  }

  const mapOne = (u: ApiUser): RowUser => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: ROLE_MAP[u.roleId] ?? "staff",
    isActive: !!u.isActive,
    avatarUrl:
      u.avatarUrl ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        u.fullName || "U"
      )}`,
    createdAt: u.createdAt,
    managerId: u.managerId ?? null,
    children: (childrenOf[u.id] || []).map(mapOne),
  });

  return roots.map(mapOne);
}

export default function UserList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL -> state
  const pageFromUrl = Number(searchParams.get("page") ?? "1");
  const qFromUrl = searchParams.get("q") || "";
  const sortByFromUrl = searchParams.get("sortBy");
  const orderFromUrl = (searchParams.get("order") as "asc" | "desc") || "asc";
  const addFromUrl = searchParams.get("add") === "1";

  const [page, setPage] = useState<number>(Math.max(1, pageFromUrl));
  const [pageSize] = useState<number>(20);
  const [searchValue, setSearchValue] = useState(qFromUrl);
  const [sorting, setSorting] = useState<SortingState>(
    sortByFromUrl ? [{ id: sortByFromUrl, desc: orderFromUrl === "desc" }] : []
  );

  const [rows, setRows] = useState<RowUser[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [editing, setEditing] = useState<RowUser | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  
  const [reloadKey, setReloadKey] = useState(0);
  const refetchList = () => {
    setReloadKey((k) => k + 1);
    router.refresh();           
  };



async function handleSearch() {
  const term = (searchValue || "").trim();
  if (!term) { setIsSearching(false); setPage(1); return; }

  setLoading(true);
  setErr(null);
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    let id: number | null = null;
    if (/^\d+$/.test(term)) {
      id = Number(term);
    } else {
      // tümünü çek, isimden id bul
      const res = await apiListUsers({ page: 1, pageSize: 9999, token });
      const items = (res.items as any[]) || [];
      const termTR = term.toLocaleLowerCase("tr-TR");
      const hit = items.find(u =>
        (u.fullName || "").toLocaleLowerCase("tr-TR").includes(termTR)
      );
      id = hit?.id ?? null;
    }

    if (id == null) {
      setErr("User not found");
      setRows([]); setTotalItems(0); setTotalPages(1); setIsSearching(true);
      return;
    }

    const u = await apiGetUser(id, token);

    setRows([{
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: ROLE_MAP[u.roleId] ?? "staff",
      isActive: !!u.isActive,
      avatarUrl:
        u.avatarUrl ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName || "U")}`,
      createdAt: u.createdAt,
      managerId: u.managerId ?? null,
      children: [],
    }]);
    setTotalItems(1);
    setTotalPages(1);
    setIsSearching(true);
  } catch (e: any) {
    setErr(e?.message || "Search failed");
    setRows([]); setTotalItems(0); setTotalPages(1); setIsSearching(true);
  } finally {
    setLoading(false);
  }
}



  //  listeyi çek
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isSearching) return;
      try {
        setLoading(true);
        setErr(null);

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const sortBy = sorting[0]?.id ?? null;
        const sortDir = sorting[0]?.desc ? "desc" : "asc";

        const res = await apiListUsers({
          page,
          pageSize,
          sortBy,
          sortDir,
          search: searchValue || null,
          token,
        });

        if (cancelled) return;
        if (res) {
          setRows(toRowUsers(res.items as unknown as ApiUser[]));
          setTotalItems(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message || "Users fetch failed");
        setRows([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    pageSize,
    searchValue,
    JSON.stringify(sorting),
    isSearching,
    reloadKey, 
  ]);

  // state -> URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    if (searchValue) params.set("q", searchValue);
    else params.delete("q");
    if (sorting[0]) {
      params.set("sortBy", sorting[0].id);
      params.set("order", sorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("order");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [page, searchValue, JSON.stringify(sorting)]);

  const pagination = useMemo(
    () => ({ page, totalPages, totalItems }),
    [page, totalPages, totalItems]
  );

  // silme
  async function handleDelete(u: RowUser) {
    const ok = window.confirm(`Delete user "${u.fullName}"`);
    if (!ok) return;

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setDeletingId(Number(u.id));
      await apiDeleteUser(Number(u.id), token || undefined);
      // listeyi yenile
      setIsSearching(false);
      refetchList();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  // kolonlar
  const columns = useMemo(
    () =>
      usersColumns(
        (u) => setEditing(u),
        (u) => {
          if (deletingId) return;
          handleDelete(u);
        }
      ),
    [deletingId]
  );

  return (
    <Card className="gap-10 p-[30px]">
      <div className="flex justify-between items-center gap-2">
        <p className="flex-1 font-bold text-xl">All Users</p>

        {/* Search */}
        <div className="relative hidden md:block">
          <Input
            placeholder="Name search"
            className="pl-10 py-2!"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-px top-px p-[12px] [&_svg]:size-5!"
            onClick={handleSearch}
            aria-label="Search"
          >
            <Search />
          </Button>
        </div>

        <Button size="icon" variant="ghost" className="border md:hidden">
          <SearchIcon />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="border hidden md:flex"
          onClick={() => {
            setIsSearching(false);
            setSearchValue("");
            setPage(1);
            refetchList();
          }}
          aria-label="Refresh"
        >
          <RefreshCwIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <CalendarIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <FunnelIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border">
          <EllipsisVerticalIcon />
        </Button>

        {/* Add New User (üst bar) */}
        <Button
          className="gap-2 hidden md:inline-flex"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("add", "1");
            router.replace(`${pathname}?${params.toString()}`);
          }}
        >
          <PlusCircleIcon className="size-5" />
          Add New User
        </Button>

     
        <Button
          size="icon"
          className="md:hidden"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("add", "1");
            router.replace(`${pathname}?${params.toString()}`);
          }}
          aria-label="Add New User"
        >
          <PlusCircleIcon className="size-5" />
        </Button>
      </div>

      {/* Liste/State */}
      {loading ? (
        <div className="py-10 text-sm text-muted-foreground">Loading users…</div>
      ) : err ? (
        <div className="py-10 text-sm text-red-500">{err}</div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-sm text-muted-foreground">No users found.</div>
      ) : (
        <CommentsDataTable
          columns={columns}
          data={rows}
          pagination={pagination}
          onPaginationChange={(newPage /* number */, _pageSize /* number */) => {
            setIsSearching(false);
            setPage(newPage);
          }}
          onSortingChange={(nextSorting) => {
            setIsSearching(false);
            setSorting(nextSorting);
          }}
          sorting={sorting}
        />
      )}

      {/* Add -> modal (URL ?add=1 ile açılır) */}
      <AddUserModal
        forceOpen={addFromUrl}
        onCreated={() => {
          // ?add parametresini temizle
          const params = new URLSearchParams(searchParams.toString());
          if (params.has("add")) {
            params.delete("add");
            router.replace(`${pathname}?${params.toString()}`);
          }
          refetchList();
        }}
        onClose={() => {
          const params = new URLSearchParams(searchParams.toString());
          if (params.has("add")) {
            params.delete("add");
            router.replace(`${pathname}?${params.toString()}`);
          }
        }}
      />

      {/* Edit -> modal */}
      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onUpdated={() => {
          setEditing(null);
          refetchList();
        }}
      />
    </Card>
  );
}
