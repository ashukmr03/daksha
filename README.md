# Daksha — Women's Marketplace

A platform connecting women entrepreneurs with local customers. Buyers browse and order from home kitchens, craft studios, bakeries and more. Sellers manage their shop, products and orders through a dedicated dashboard.

---

## Project Structure

```
daksha/
├── server/        — Express + MongoDB API          (port 5000)
├── client/        — Buyer app (React + Vite)       (port 3000)
└── seller-app/    — Seller dashboard (React + Vite) (port 5001)
```

---

## Running the Project

### Install dependencies

```bash
# From the root folder
npm run install:all
```

Or individually:

```bash
cd server     && npm install
cd client     && npm install
cd seller-app && npm install
```

### Start everything

```bash
# From root — starts server + buyer app + seller app
npm run dev
```

Or individually:

```bash
cd server     && npm run dev    # API on :5000
cd client     && npm run dev    # Buyer on :3000
cd seller-app && npm run dev    # Seller on :5001
```

---

## Apps

### Buyer App — localhost:3000

- Sign in with name + phone number (no password)
- Browse verified women-led businesses by category
- View seller profiles and product listings
- Place orders and pay via UPI after acceptance
- Track all orders by phone number

### Seller App — localhost:5001

- Register a business (multi-step: profile, category, UPI, products)
- Seller login with username + password
- Dashboard: overview, orders, transactions, earnings, products
- Accept or reject incoming orders
- Mark orders as delivered

### API — localhost:5000

- `POST /api/auth/register` — seller registration
- `POST /api/auth/login` — seller login
- `GET  /api/sellers` — list sellers (with filters)
- `GET  /api/sellers/:id` — seller detail
- `POST /api/orders` — place order
- `GET  /api/orders/seller` — seller's orders (auth required)
- `GET  /api/orders/buyer/:phone` — buyer's orders by phone
- `PATCH /api/orders/:id/status` — update order status
- `PATCH /api/orders/:id/pay` — mark payment done

---

## Tech Stack

- **Frontend:** React 18, React Router v6, Vite
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT (sellers), phone-based session (buyers, localStorage)
- **Payments:** Direct UPI — no payment gateway, zero platform cut

---

## Environment Variables

Create `server/.env`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
