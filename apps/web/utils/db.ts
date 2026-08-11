import { PrismaClient } from "@prisma/client";

// Check if we're in a production build or if DATABASE_URL is explicitly set
// In development, we allow missing DATABASE_URL for frontend-only builds
// since the web app should communicate via API to the backend service
const prismaClientSingleton = () => {
    // Only require DATABASE_URL if we're actually going to use the Prisma client
    // For frontend-only builds that proxy to backend API, we don't need DB access
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        // Return a mock client that will throw a clear error if used
        // This helps identify when frontend code incorrectly tries to access DB directly
        return new Proxy({} as PrismaClient, {
            get(target, prop: string) {
                if (prop === '$connect' || prop === '$disconnect' ||
                    prop === '$on' || prop === '$once' || prop === '$use' ||
                    prop === '$transaction' || prop === '$executeRaw' ||
                    prop === '$queryRaw') {
                    return () => {
                        throw new Error('Database access attempted in frontend. The web app should communicate with the backend API on port 3001 instead of accessing the database directly.');
                    };
                }
                // For any other property, return undefined or throw
                return () => {
                    throw new Error('Database access attempted in frontend. The web app should communicate with the backend API on port 3001 instead of accessing the database directly.');
                };
            }
        });
    }

    // Parse DATABASE_URL to check SSL configuration
    const url = new URL(databaseUrl);

    // Log SSL configuration for debugging
    if (process.env.NODE_ENV === "development") {
        console.log(`���🔌 Database connection: ${url.protocol}//${url.hostname}:${url.port || '3306'}`);
        console.log(`���🔒 SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
    }

    return new PrismaClient({
        // Add logging for debugging
        log: process.env.NODE_ENV === "development"
            ? ['query', 'info', 'warn', 'error']
            : ['error', 'warn'],
    });
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;