# fishnet Fishnet API Testing Guide

## Important: browser URL versus API request

Opening `http://localhost:4000/api/auth/register` in a browser sends a **GET** request. This endpoint accepts **POST** only, so `{"error":"Route not found"}` is expected.

Use Postman, Insomnia, or `curl` for POST, PUT, and DELETE endpoints. The API base URL is:

```text
http://localhost:4000
```

All JSON requests require this header:

```text
Content-Type: application/json
```

Protected routes additionally require:

```text
Authorization: Bearer {{accessToken}}
```

## Postman setup

Create an environment with these variables:

| Variable | Value |
| --- | --- |
| `baseUrl` | `http://localhost:4000` |
| `accessToken` | Set after login |
| `productId` | A product UUID from `GET /api/products` |
| `categoryId` | A category UUID from `GET /api/categories` |
| `merchantId` | A merchant UUID from `GET /api/merchants` |

Use `{{baseUrl}}/api/...` in every request. For login, add this Postman **Tests** script to save the returned token:

```javascript
pm.environment.set("accessToken", pm.response.json().token);
```

## Recommended test order

1. `GET {{baseUrl}}/health` — must return `200`.
2. `POST {{baseUrl}}/api/auth/register` — create a buyer.
3. `POST {{baseUrl}}/api/auth/login` — save `token` as `accessToken`.
4. `GET {{baseUrl}}/api/auth/me` — verify the token.
5. Test public catalog endpoints.
6. Test buyer-protected endpoints with the buyer token.
7. Login as a seller or admin before testing seller/admin endpoints.

## Runtime endpoints

| Method | URL | Expected result |
| --- | --- | --- |
| GET | `/health` | `200` when Express is running |
| GET | `/rate-limit-info` | Current rate-limit policy information |

## Authentication

### Register buyer

`POST /api/auth/register`

```json
{
  "email": "buyer@example.com",
  "password": "StrongPassword123!"
}
```

Expected: `201` with a user and JWT token. Use a unique email for every new registration test.

### Login

`POST /api/auth/login`

```json
{
  "email": "buyer@example.com",
  "password": "StrongPassword123!"
}
```

Expected: `200` with `token` and `user`. Wrong credentials correctly return `401`.

### Current user and logout

| Method | URL | Authentication | Expected |
| --- | --- | --- | --- |
| GET | `/api/auth/me` | Any logged-in user | `200` |
| POST | `/api/auth/logout` | Any logged-in user | `200` |
| POST | `/api/auth/forgot-password` | Public | `200` or validation error |

Forgot-password body:

```json
{ "email": "buyer@example.com" }
```

### Google OAuth

| Method | URL | Notes |
| --- | --- | --- |
| GET | `/api/auth/oauth/google/start?next=/` | Opens Google sign-in redirect |
| GET | `/api/auth/oauth/google/callback` | Called by Google only |
| GET | `/api/v1/auth/oauth/google/start?next=/` | Compatibility URL |
| GET | `/api/v1/auth/oauth/google/callback` | Configure this callback in Google Cloud |

Google OAuth requires valid `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI` values in `apps/api/.env`.

## Catalog and search

| Method | URL | Body / parameters | Access |
| --- | --- | --- | --- |
| GET | `/api/products?page=1&limit=20` | Optional `page`, `limit`, `mode`, `query` | Public |
| POST | `/api/products` | Product body below | Seller/Admin |
| GET | `/api/products/:productId` | Product UUID | Public |
| PUT | `/api/products/:productId` | Fields to change | Seller/Admin |
| DELETE | `/api/products/:productId` | None | Seller/Admin |
| GET | `/api/slugs/:slug` | Product slug | Public |
| GET | `/api/search?query=fishnet` | `query` required | Public |
| GET | `/api/search/suggest?query=fi` | Minimum 2 characters | Public |

Create/update product example:

```json
{
  "title": "Nylon Gill Net",
  "description": "Commercial fishing net",
  "price": 2500,
  "inStock": 10,
  "merchantId": "{{merchantId}}",
  "categoryId": "{{categoryId}}",
  "slug": "nylon-gill-net"
}
```

| Method | URL | Body / parameters | Access |
| --- | --- | --- | --- |
| GET | `/api/categories` | None | Public |
| POST | `/api/categories` | `{ "name": "Gill Nets" }` | Current route policy |
| GET | `/api/categories/:categoryId` | Category UUID | Public |
| PUT | `/api/categories/:categoryId` | `{ "name": "Updated Name" }` | Current route policy |
| DELETE | `/api/categories/:categoryId` | None | Current route policy |
| GET | `/api/merchants` | None | Public |
| POST | `/api/merchants` | Merchant body below | Current route policy |
| GET | `/api/merchants/:merchantId` | Merchant UUID | Public |
| PUT | `/api/merchants/:merchantId` | Fields to change | Current route policy |
| DELETE | `/api/merchants/:merchantId` | None | Current route policy |

Merchant body example:

```json
{
  "name": "Ocean Nets Store",
  "email": "seller@example.com",
  "phone": "+919999999999",
  "address": "Chennai, Tamil Nadu",
  "description": "Fishing-net supplier",
  "status": "ACTIVE"
}
```

## User management

The following routes exist for administrative/user-management flows. Use an admin JWT where your deployment requires it.

| Method | URL | Body / parameters |
| --- | --- | --- |
| GET | `/api/users` | None |
| POST | `/api/users` | `{ "email": "user@example.com", "password": "StrongPassword123!", "role": "BUYER" }` |
| GET | `/api/users/:userId` | User UUID |
| PUT | `/api/users/:userId` | One or more of `email`, `password`, `role` |
| DELETE | `/api/users/:userId` | None |
| GET | `/api/users/email/:email` | URL-encode the email address |

## Images and bulk upload

| Method | URL | Body / parameters |
| --- | --- | --- |
| GET | `/api/images/:imageId` | Image UUID |
| POST | `/api/images` | `{ "productID": "{{productId}}", "image": "uploads/net.jpg" }` |
| PUT | `/api/images/:imageId` | `{ "productID": "{{productId}}", "image": "uploads/new-net.jpg" }` |
| DELETE | `/api/images/:imageId` | None |
| POST | `/api/main-image` | `multipart/form-data`; file field `uploadedFile`; returns `{ "filename": "..." }` |
| POST | `/api/bulk-upload` | `multipart/form-data`; file field `file` containing CSV |
| GET | `/api/bulk-upload` | None |
| GET | `/api/bulk-upload/:batchId` | Batch UUID |
| PUT | `/api/bulk-upload/:batchId` | `{ "items": [] }` |
| DELETE | `/api/bulk-upload/:batchId?deleteProducts=true` | Optional query flag |

## Wishlist, orders, and buyer routes

All routes in this section require a buyer JWT unless noted otherwise.

| Method | URL | Body / parameters |
| --- | --- | --- |
| GET | `/api/wishlist` | Current user's items |
| POST | `/api/wishlist` | `{ "productId": "{{productId}}" }` |
| GET | `/api/wishlist/:userId` | Own user ID; admin may read other users |
| GET | `/api/wishlist/:userId/:productId` | Own user ID and product UUID |
| DELETE | `/api/wishlist/product/:productId` | Removes current user's item |
| GET | `/api/orders?page=1&limit=50` | Legacy order listing |
| POST | `/api/orders` | Order body below |
| GET | `/api/orders/:orderId` | Order UUID |
| PUT | `/api/orders/:orderId` | Partial order updates |
| DELETE | `/api/orders/:orderId` | None |
| GET | `/api/order-product` | Legacy order items |
| POST | `/api/order-product` | Not supported; use `POST /api/orders` instead |
| GET | `/api/order-product/:orderId` | Order UUID |
| PUT | `/api/order-product/:id` | `{ "quantity": 2 }` |
| DELETE | `/api/order-product/:id` | None |
| POST | `/api/marketplace-orders` | Checkout body |
| GET | `/api/buyer/orders` | Optional `status` query |
| GET | `/api/buyer/orders/:orderId` | Own order UUID |

Order example:

```json
{
  "name": "Arun",
  "lastname": "Kumar",
  "email": "buyer@example.com",
  "phone": "+919999999999",
  "adress": "12 Harbour Road",
  "city": "Chennai",
  "country": "India",
  "postalCode": "600001",
  "products": [
    { "productId": "{{productId}}", "quantity": 1 }
  ]
}
```

## Seller routes

| Method | URL | Body / parameters | Access |
| --- | --- | --- | --- |
| POST | `/api/seller/register` | Seller registration data | Public |
| POST | `/api/seller/onboarding` | `{ "merchantName": "Ocean Nets", "merchantDescription": "...", "merchantPhone": "+919999999999", "merchantAddress": "Chennai" }` | Logged-in Buyer |
| GET | `/api/seller/stats` | None | Seller/Admin |
| GET | `/api/seller/:merchantId/status` | Merchant UUID | Logged in |
| PUT | `/api/seller/:merchantId/documents` | `{ "verificationDocuments": [] }` | Logged in |
| PUT | `/api/seller/:merchantId/status` | `{ "verificationStatus": "APPROVED", "verificationNotes": "Verified" }` | Admin |
| GET | `/api/seller/orders?merchantId=:id&status=PENDING` | Optional filters | Seller |
| PUT | `/api/seller/orders/:sellerOrderId/status` | `{ "status": "PROCESSING" }` | Seller |
| GET | `/api/seller/products` | None | Seller |
| POST | `/api/seller/products` | Product body | Seller |
| GET | `/api/seller/products/:productId` | Product UUID | Seller |
| PUT | `/api/seller/products/:productId` | Product fields | Seller |
| DELETE | `/api/seller/products/:productId` | None | Seller |

## Payments

| Method | URL | Body / parameters | Access |
| --- | --- | --- | --- |
| POST | `/api/payment/create-payment-intent` | `{ "amount": 2500, "currency": "inr", "metadata": {} }` | Checkout |
| POST | `/api/payment/intent` | Payment-service order payload | Logged in |
| POST | `/api/payment/:paymentId/confirm` | `{ "paymentMethodId": "pm_..." }` | Logged in |
| GET | `/api/payment/:paymentId/verify` | Payment UUID | Logged in |
| POST | `/api/payment/:paymentId/refund` | Optional `{ "amount": 2500 }` | Logged in/Admin policy |
| GET | `/api/payment/:paymentId` | Payment UUID | Logged in |
| POST | `/api/payment-webhook` | Stripe webhook raw body; do not test with normal JSON | Stripe only |

`/api/payments/...` supports the same payment routes as `/api/payment/...`.

## Notifications, reviews, users, and admin

| Method | URL | Body / parameters | Access |
| --- | --- | --- | --- |
| GET | `/api/notifications/:userId?page=1&limit=10` | Optional `type`, `isRead`, `search`, `sortBy`, `sortOrder` | Logged in |
| GET | `/api/notifications/:userId/unread-count` | User UUID | Logged in |
| POST | `/api/notifications` | `{ "userId": "...", "title": "Order update", "message": "...", "type": "ORDER_UPDATE" }` | Logged in |
| POST | `/api/notifications/mark-read` | `{ "notificationIds": [], "userId": "..." }` | Logged in |
| PUT | `/api/notifications/:id` | `{ "isRead": true }` | Logged in |
| DELETE | `/api/notifications/:id` | `{ "userId": "..." }` | Logged in |
| DELETE | `/api/notifications/bulk` | `{ "notificationIds": [], "userId": "..." }` | Logged in |
| GET | `/api/review/products/:productId/reviews?limit=10&offset=0` | Product UUID | Public |
| POST | `/api/review` | Review body below | Logged in |
| GET | `/api/review/user/reviews?limit=10&offset=0` | Pagination | Logged in |

Review body example:

```json
{
  "orderItemId": "ORDER_ITEM_UUID",
  "productQuality": 5,
  "accuracy": 5,
  "sellerCommunication": 5,
  "delivery": 5,
  "overallExperience": 5,
  "comment": "Good quality net."
}
```

Admin JWT required for all routes below:

| Method | URL | Body / parameters |
| --- | --- | --- |
| GET | `/api/admin/products/moderation?page=1&limit=10&search=` | Optional pagination/search |
| PUT | `/api/admin/products/:productId/moderate` | `{ "action": "APPROVE", "reason": "Approved" }` |
| GET | `/api/admin/users/moderation?page=1&limit=10&search=` | Optional pagination/search |
| PUT | `/api/admin/users/:userId/moderate` | `{ "action": "APPROVE", "reason": "Verified" }` |
| GET | `/api/admin/reports?type=all&page=1&limit=10` | Optional filters |
| PUT | `/api/admin/reports/:reportId/resolve` | `{ "action": "RESOLVED", "notes": "Handled" }` |

## Expected errors

| Status | Meaning | Typical fix |
| --- | --- | --- |
| `400` | Missing/invalid body or query | Check JSON field names and required parameters |
| `401` | No, expired, or invalid JWT | Login again and update `{{accessToken}}` |
| `403` | Correct JWT but wrong role | Use seller/admin account as required |
| `404` | Wrong HTTP method, wrong URL, or missing record | Verify method and use a real UUID/slug |
| `409` | Duplicate record | Use a new email or unique resource value |
| `500` | Server/configuration failure | Check API console and environment variables |

## Common Postman examples

```bash
# Public health check
curl http://localhost:4000/health

# Register: POST, not browser GET
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer@example.com\",\"password\":\"StrongPassword123!\"}"

# Authenticated request
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
