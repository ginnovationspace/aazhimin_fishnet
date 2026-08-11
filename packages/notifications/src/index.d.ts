/**
 * Create and send an order update notification via email
 * @param userEmail - The user's email address
 * @param userId - The user's ID (optional, for logging)
 * @param status - The order status (confirmed, processing, shipped, delivered, etc.)
 * @param orderId - The order ID
 * @param total - The order total amount
 */
export declare function createOrderUpdateNotification(userEmail: string, userId: string, status: string, orderId: string, total: number): Promise<void>;
//# sourceMappingURL=index.d.ts.map