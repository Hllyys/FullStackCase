"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiListAllUsers, apiUpdateUser } from "@/app/apihelper";

type EditUserModalProps = {
  user: {
    id: number;
    fullName: string;
    isActive: boolean;
    managerId: number | null;
  } | null;
  onClose: () => void;
  onUpdated: () => void; 
};

export default function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const open = !!user;

  const [fullName, setFullName] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [managerId, setManagerId] = React.useState<string>("");

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [managers, setManagers] = React.useState<Array<{ id: number; fullName: string }>>([]);

  // user değişince formu doldur
  React.useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setIsActive(!!user.isActive);
    setManagerId(user.managerId != null ? String(user.managerId) : "");
  }, [user]);

  // manager listesi çek
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const data = await apiListAllUsers(token);

        const list: any[] = data?.data ?? data?.items ?? [];
        // Sadece manager rolünü ayıkla (roleId=2 veya roleName="Manager")
        const mans = list.filter(
          (u) => u.roleId === 2 || (u.roleName && String(u.roleName).toLowerCase() === "manager")
        );
        if (!cancelled) {
          setManagers(mans.map((m) => ({ id: m.id, fullName: m.fullName })));
        }
      } catch (e) {
        throw e;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErr(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      await apiUpdateUser(
        user.id,
        {
          fullName,
          isActive,
          managerId: managerId ? Number(managerId) : null,
        },
        token
      );

      onUpdated(); 
      onClose();   
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Edit user</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Update name, active status and manager.
          </Dialog.Description>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="mr-3">Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-1">
              <Label>Manager</Label>
              <select
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">None</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            {err && <p className="text-sm text-red-500">{err}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute right-3 top-3 rounded p-2 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
