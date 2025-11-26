"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
class UserService {
    async login(email, pass) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(pass, user.password))) {
            throw new Error('Invalid credentials');
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        // Ideally store refresh token hash in DB
        return { user: { id: user.id, email: user.email, role: user.role }, accessToken };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map