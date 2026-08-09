"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    globalThis.prismaGlobal = prisma;
}
//# sourceMappingURL=index.js.map