export type UserRole = "ADMIN" | "USER";

export type UserAccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export interface AccountUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatar: string | null;
    bio: string | null;
    role: UserRole;
    status: UserAccountStatus;
    lastActive: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthSessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthResult {
    user: AuthSessionUser;
    accessToken?: string;
}

export interface SessionClaims {
    sub: string;
    email: string;
    role: string;
    exp?: number;
}

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    canceledSubscriptions: number;
    overdueInvoices: number;
    timestamp: string;
}
