import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

module.exports = prisma;

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  globalThis.prismaGlobal = prisma;
}
