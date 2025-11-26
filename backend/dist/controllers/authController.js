"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const UserService_1 = require("../services/UserService");
const validation_1 = require("../utils/validation");
const userService = new UserService_1.UserService();
const login = async (req, res, next) => {
    try {
        const { email, password } = validation_1.loginSchema.parse(req.body);
        const result = await userService.login(email, password);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ message: error.message });
            return;
        }
        next(error);
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map