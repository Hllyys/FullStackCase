// User interface for individual user items
interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "manager" | "staff" | "viewer";
  isActive: boolean;
  createdAt: string; // ISO date string
}

// Response interface for the API response
interface UsersResponse {
  message: string;
  status: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: User[];
}
