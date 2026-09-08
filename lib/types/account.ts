import type {
    AdminStatsDto,
    AuthResponseDto,
    AuthResponseUserDto,
    PublicUserDto,
} from "@/lib/contract/schemas";

export type AccountUser = PublicUserDto;
export type AdminStats = AdminStatsDto;

export type UserRole = PublicUserDto["role"];
export type UserAccountStatus = PublicUserDto["status"];

export type AuthUser = AuthResponseUserDto;
export type AuthResult = AuthResponseDto;

export interface SessionClaims {
    sub: string;
    email: string;
    role: string;
    exp?: number;
}
