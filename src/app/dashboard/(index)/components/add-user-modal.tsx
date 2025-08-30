"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircleIcon } from "lucide-react";
import { apiRegister } from "@/app/apihelper";

type Props = {
  onCreated?: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
};

export default function AddUserModal({ onCreated, forceOpen = false, onClose }: Props) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  // form state'leri
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [roleId, setRoleId] = React.useState<number>(3);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiRegister({ fullName, email, password, roleId, managerId: null });
      if (res?.user) {
        setSuccess(`Created: ${res.user.fullName}`);
        setFullName(""); setEmail(""); setPassword(""); setRoleId(3);
        onCreated?.();     
        setTimeout(() => setOpen(false), 300);
        
      } else setError("Create failed");
    } catch (err: any) {
      setError(err?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClose?.(); 
      }}
    >
      <Dialog.Trigger asChild>
        <Button><PlusCircleIcon className="mr-2 h-4 w-4" />Add New User</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Create account</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            It’s quick and easy.
          </Dialog.Description>

          <form onSubmit={onSubmit} className="space-y-3">
            <Input placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
            <Input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" minLength={6} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required />

            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={roleId} onChange={e=>setRoleId(Number(e.target.value))}>
                <option value={1}>Admin</option>
                <option value={2}>Manager</option>
                <option value={3}>Staff</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </form>

          <Dialog.Close asChild>
            <button className="absolute right-3 top-3 rounded p-2 text-muted-foreground hover:bg-muted" aria-label="Close">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
