const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export async function apiLogin(email: string, password: string) {
try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw (txt || "Login failed");
    }
  return res.json() as Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: number; fullName: string; email: string; roleId: number };
  }>;
} catch (error) {
  console.error("Login error:", error);
  throw (error|| "Login failed, please try again");

}
}


export async function apiRegister(payload: {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  managerId: number | null;
}) {
try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw (msg || "Register failed");
  }
    const data = await res.json();
    return {
      success: true,
      message: "Kayıt başarıyla tamamlandı ",
      ...data,
    };
} catch (error) {
  console.error("Register error:", error);
  throw (error|| "Register failed, please try again");
}
}



export async function apiGetUsers(token?: string): Promise<
  Array<{ id: number; fullName: string; email: string; roleId: number }>
> {
  const res = await fetch(`${BASE_URL}/users`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.status === 401) return [];

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Users fetch failed");
  }
  return res.json();
}

export async function apiLogout(refreshToken: string) {
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }), 
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw (txt || "Logout failed");
  }
  const data = await res.json();
    return {
      success: true,
      message: "Çıkış işlemi başarıyla tamamlandı ✅",
      ...data, 
    };

  } catch (error) {
      console.error("Logout error:", error);
  throw (error|| "Logout failed, please try again");
  }
}



export type ListUsersParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDir?: "asc" | "desc" | null;
  search?: string | null;
  token?: string | null;
};

export async function apiListUsers(params: ListUsersParams) {
try {
    const {
    page = 1,
    pageSize = 20,
    sortBy = null,
    sortDir = null,
    search = null,
    token = null,
  } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(pageSize));
  if (sortBy) qs.set("sortBy", sortBy);
  if (sortDir) qs.set("order", sortDir);
  if (search) qs.set("q", search);

  const res = await fetch(`${BASE_URL}/users?${qs.toString()}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let msg = raw;
    try {
      const j = raw ? JSON.parse(raw) : null;
      msg = j?.error?.message || j?.message || msg;
    } catch {}
    throw (msg || `Users fetch failed (${res.status})`);
  }

  const data = await res.json();

  
  const arr = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? {};

  return {
          success: true,
      message: "Kullanıcı listesi başarıyla getirildi ",
    items: arr,
    total: pagination.totalItems ?? arr.length,
    page: pagination.page ?? page,
    totalPages: pagination.totalPages ?? 1,
  };
} catch (error) {
   console.error("ListUsers error:", error);
    return {
      success: false,
      message: error || "Kullanıcı listesi getirilemedi ",
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
}
}


export async function apiGetUser(id: number, token?: string | null) {
 try {
   const res = await fetch(`${BASE_URL}/users/${id}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
  });

  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    let msg = raw;
    try {
      const j = raw ? JSON.parse(raw) : null;
      msg = j?.error?.message || j?.message || msg;
    } catch {}
    throw (msg || `Get user failed (${res.status})`);
  }

  if (!raw) throw new Error("Empty response");
  const j = JSON.parse(raw);

  return j?.data;
 } catch (error) {
  console.error("GetUser error:", error);
  throw (error);
 }
}

/** Kullanıcı sil (DELETE /api/users/:id) */
export async function apiDeleteUser(id: number, token?: string | null) {
  try {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const txt = await res.text().catch(() => "");
  if (!res.ok) {
    let msg = txt;
    try {
      const j = txt ? JSON.parse(txt) : null;
      msg = j?.error?.message || j?.message || msg;
    } catch {}
    throw (msg || `Delete failed (${res.status})`);
  }
  return txt ? JSON.parse(txt) : { success: true }; 
  } catch (error) {
    console.error("DeleteUser error:", error);
  throw (error)
  }
}


export type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  managerId?: number | null;
};

export async function apiCreateUser(payload: CreateUserPayload, token?: string | null) {
try {
    const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Create user failed");
  }
  return res.json(); 
} catch (error) {
  console.error("CreateUser error:", error);
  throw (error)
}
}

// Yalnızca manager’ları (ya da tüm kullanıcıları) getirmek için
export async function apiListManagers(token?: string | null) {
 try {
  const url = `${BASE_URL}/users?role=manager`;
  const res = await fetch(url, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Managers fetch failed");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
 } catch (error) {
  console.error("ApiListManager error:", error);
  throw (error)
 }
}




export async function apiListAllUsers(token?: string | null) {
try {
    const res = await fetch(`${BASE_URL}/users?page=1&limit=9999`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Users fetch failed");
  }
  return res.json(); 
} catch (error) {
  console.error("GetUsers error:", error);
  throw (error)
}
}

// Kullanıcı güncelleme (PUT /api/users/:id)
export async function apiUpdateUser(
  id: number,
  body: { fullName?: string; isActive?: boolean; managerId?: number | null },
  token?: string | null
) {
try {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Update failed");
  }
  return res.json(); 
} catch (error) {
  console.error("UpdateUser error:", error);
  throw (error)
}
}
