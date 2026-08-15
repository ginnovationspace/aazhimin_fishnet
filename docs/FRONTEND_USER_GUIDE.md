# fishnet Fishnet Marketplace User Guide

## Purpose

fishnet is a fishnet marketplace with a **buyer-first** experience. Everyone starts by browsing and buying. A signed-in buyer can later choose to become a seller and create a seller profile on the same account.

## Buyer journey

### 1. Browse the marketplace

1. Open the home page.
2. Browse featured fishnets or use **Shop** to see the complete catalog.
3. Use search to find a product by name, type, or keyword.
4. Open a product page to review its price, stock, images, seller information, and reviews.

No account is required to browse products.

### 2. Create an account

1. Select **Register** in the site header.
2. Enter your name, email address, and password.
3. Submit the form.
4. Go to **Login** and sign in with the same email and password.

The account is created as a `BUYER` account by default. A buyer can browse, save items, add products to the cart, and place orders.

### 3. Sign in

1. Select **Login**.
2. Enter your email and password, or choose Google sign-in when Google OAuth has been configured.
3. After successful sign-in, return to the marketplace home page.
4. Open the account menu to access **My Account** and **My Orders**.

If the login page still appears after signing in, refresh once and verify the browser allows local storage. The web app saves the access token in local storage and sends it to the Express API automatically.

### 4. Shop and checkout

1. Open a fishnet product.
2. Select **Add to Cart**.
3. Open **Cart** and change quantities if needed.
4. Select **Checkout**.
5. Provide delivery contact details and address.
6. Complete the payment step.
7. Submit the order.

The order appears under **My Orders** after it is created.

### 5. Wishlist and notifications

1. Use the heart icon on a product to save it.
2. Open the wishlist to review saved fishnets.
3. Use the notification bell to view order and account updates.

Wishlist and notification requests require a signed-in account.

### 6. Forgot password

1. Select **Forgot password?** on the login page.
2. Enter the account email address.
3. Submit the request.

The response always says that reset instructions will be sent if the account exists. This is intentional and prevents other people from discovering which email addresses have accounts.

## Become a seller

### Buyer-to-seller onboarding

1. Sign in to a buyer account first.
2. Open the account menu.
3. Select **Become a seller**.
4. Enter your business name, contact phone number, address, and business description.
5. Create the seller account.
6. The account changes to `SELLER` immediately.
7. Open **Seller Dashboard** to manage products and orders.

Do not create a second account just to sell. The seller profile belongs to the existing buyer account, so order history and account identity stay together.

## Seller journey

### 1. Seller dashboard

After seller onboarding, use **Seller Dashboard** to view:

- Product counts and stock information.
- Pending and completed orders.
- Revenue and payout information.
- Seller verification status.

### 2. Add products

1. Open **Seller Dashboard**.
2. Select **My Products**.
3. Select **Add Product**.
4. Enter title, price, stock, category, description, and product details.
5. Upload a main product image.
6. Submit the product.

The product is linked to the seller business and is available according to the marketplace moderation and verification rules.

### 3. Manage products

1. Open **My Products**.
2. Select a product to edit title, price, stock, images, and description.
3. Save changes.
4. Delete a product only when it is no longer needed.

### 4. Fulfil orders

1. Open **Seller Orders**.
2. Review the order details and delivery information.
3. Update the order status as it moves through fulfilment.
4. Keep stock and product availability accurate.

## Administrator journey

Administrators use the admin area to manage users, categories, merchants, products, orders, reports, and seller verification. Admin functions are not displayed as buyer shopping actions.

## Account roles

| Role | Main capabilities |
| --- | --- |
| Buyer | Browse, cart, checkout, orders, wishlist, reviews |
| Seller | Buyer capabilities plus seller dashboard, products, fulfilment, verification |
| Admin | Marketplace moderation, users, categories, merchants, reports, verification |

## Support checklist

If an action does not work:

1. Confirm the API is running on `http://localhost:4000`.
2. Confirm the web app uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.
3. Sign out and sign in again to refresh the access token.
4. For seller/admin screens, verify the account has the correct role.
5. Review `docs/API_TESTING.md` to verify the Express endpoint and request details.
