export declare class UserService {
    login(email: string, pass: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
    }>;
}
//# sourceMappingURL=UserService.d.ts.map