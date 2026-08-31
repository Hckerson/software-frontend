export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

export interface ApiErrorBody {
    statusCode: number;
    message: string | string[];
    error: string;
    path: string;
    timestamp: string;
}
