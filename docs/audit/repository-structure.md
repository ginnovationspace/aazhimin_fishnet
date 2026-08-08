# Aazhimin Repository Structure

## Root Directory

```
aazhimin/
|-- .eslintrc.json
|-- .gitignore
|-- .env.example
|-- apps/
|   |-- api/
|   |   |-- .gitignore
|   |   |-- app.ts
|   |   |-- package.json
|   |   |-- package-lock.json
|   |   |-- controllers/
|   |   |   |-- bulkUpload.js
|   |   |   |-- category.js
|   |   |   |-- customer_orders.js
|   |   |   |-- customer_order_product.js
|   |   |   |-- mainImages.js
|   |   |   |-- merchant.js
|   |   |   |-- nNotificationController.js
|   |   |   |-- notificationController.js
|   |   |   |-- productImages.js
|   |   |   |-- products.js
|   |   |   |-- search.js
|   |   |   |-- slugs.js
|   |   |   |-- users.js
|   |   |-- middleware/
|   |   |   |-- advancedRateLimiter.js
|   |   |   |-- errorHandler.js
|   |   |   |-- rateLimiter.js
|   |   |   |-- requestLogger.js
|   |   |-- routes/
|   |   |   |-- bulkUpload.js
|   |   |   |-- category.js
|   |   |   |-- customer_orders.js
|   |   |   |-- customer_order_product.js
|   |   |   |-- mainImages.js
|   |   |   |-- merchant.js
|   |   |   |-- notifications.js
|   |   |   |-- productImages.js
|   |   |   |-- products.js
|   |   |   |-- search.js
|   |   |   |-- slugs.js
|   |   |   |-- users.js
|   |   |   |-- wishlist.js
|   |   |-- scripts/
|   |   |   |-- backup-database.js
|   |   |   |-- check-categories.js
|   |   |   |-- create-default-categories.js
|   |   |   |-- create-sample-notifications.js
|   |   |   |-- generate-product-template.js
|   |   |   |-- migration-validator.js
|   |   |   |-- test-migration-validator.js
|   |   |-- services/
|   |   |   |-- bulkUploadService.js
|   |   |-- tests/
|   |   |   |-- check-bulk-upload.js
|   |   |   |-- curl-test-command.js
|   |   |   |-- debug-bulk-upload.js
|   |   |   |-- simple-server-test.js
|   |   |   |-- test-bulk-upload-endpoint.js
|   |   |   |-- test-create-product.js
|   |   |   |-- test-delete-batch.js
|   |   |   |-- test-upload-direct.js
|   |   |-- view-logs.js
|   |   |-- logs/
|   |   |   |-- access.log
|   |   |   |-- error.log
|   |   |-- createAdminUser.js
|   |   |-- listUsers.js
|   |   |-- makeUserAdmin.js
|   |   |-- test-db-connection.js
|   |   |-- test-logging.js
|   |   |-- test-output.txt
|   |
|   `-- web/
|       |-- app/
|       |   |-- (dashboard)/
|       |   |   |-- admin/
|       |   |   |   |-- bulk-upload/
|       |   |   |   |   `-- page.tsx
|       |   |   |   |-- categories/
|       |   |   |   |   |-- new/
|       |   |   |   |   |   `-- page.tsx
|       |   |   |   |   |-- page.tsx
|       |   |   |   |   |-- [id]/
|       |   |   |   |   |   |   `-- page.tsx
|       |   |   |   |-- merchant/
|       |   |   |   |   |-- new/
|       |   |   |   |   |   |   `-- page.tsx
|       |   |   |   |   |-- page.tsx
|       |   |   |   |-- orders/
|       |   |   |   |   |-- page.tsx
|       |   |   |   |-- page.tsx
|       |   |   |   |-- products/
|       |   |   |   |   |-- page.tsx
|       |   |   |   |   |-- [id]/
|       |   |   |   |   |   |   `-- page.tsx
|       |   |   |   |-- users/
|       |   |   |   |   |-- new/
|       |   |   |   |   |   |   `-- page.tsx
|       |   |   |   |   |-- page.tsx
|       |   |   |   |   |-- [id]/
|       |   |   |   |   |   |   `-- page.tsx
|       |   |   |   `-- layout.tsx
|       |   |-- actions/
|       |   |   `-- index.ts
|       |   |-- api/
|       |   |   |-- auth/
|       |   |   |   |-- [...nextauth]/
|       |   |   |   |   `-- route.ts
|       |   |   |-- register/
|       |   |   |   `-- route.ts
|       |   |-- cart/
|       |   |   `-- page.tsx
|       |   |-- checkout/
|       |   |   `-- page.tsx
|       |   |-- error.tsx
|       |   |-- favicon.ico
|       |   |-- login/
|       |   |   `-- page.tsx
|       |   |-- not-found.tsx
|       |   |-- notifications/
|       |   |   `-- page.tsx
|       |   |-- page.tsx
|       |   |-- product/
|       |   |   `-- not-found.tsx
|       |   |-- register/
|       |   |   `-- page.tsx
|       |   |-- search/
|       |   |   `-- page.tsx
|       |   |-- shop/
|       |   |   |-- [...slug]/
|       |   |   |   `-- page.tsx
|       |   |-- app/
|       |   |   `-- zustand/
|       |   |       |-- notificationStore.ts
|       |   |       |-- paginationStore.ts
|       |   |       |-- sortStore.ts
|       |   |       |-- store.ts
|       |   |       |-- wishlistStore.ts
|       |   `-- components/
|       |       |-- AddToCartSingleProductBtn.tsx
|       |       |-- AdminOrders.tsx
|       |       |-- Breadcrumb.tsx
|       |       |-- BulkUploadHistory.tsx
|       |       |-- Checkbox.tsx
|       |       |-- ColorInput.tsx
|       |       |-- CustomButton.tsx
|       |       |-- DashboardProductTable.tsx
|       |       |-- DashboardSidebar.tsx
|       |       |-- Heading.tsx
|       |       |-- HeartElement.tsx
|       |       |-- Hero.tsx
|       |       |-- index.ts
|       |       |-- Loader.tsx
|       |       |-- Newsletter.tsx
|       |       |-- NotificationBell.tsx
|       |       |-- OrderItem.tsx
|       |       |-- Pagination.tsx
|       |       |-- ProductsSection.tsx
|       |       |-- ProductTabs.tsx
|       |       |-- ... (and more)
|       |
|       `-- package.json
|
`-- packages/
    |-- auth/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    |-- config/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    |-- database/
    |   |-- package.json
    |   |-- tsconfig.json
    |   |-- prisma/
    |   |   `-- schema.prisma
    |   |-- src/
    |   |   `-- index.ts
    |-- notifications/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    |-- types/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    |-- ui/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    |-- validation/
    |   |-- package.json
    |   |-- tsconfig.json
    |   `-- src/
    |       `-- index.ts
    `-- db/
        |-- (contents unknown)
```