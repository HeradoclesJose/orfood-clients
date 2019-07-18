export interface ServerResponse {
    response: string;
    token: string;
    user: string;
    status: string;
    permissions: { level: string };
}
