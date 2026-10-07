# Sakhi

## Requirements
- Node.js 18+
- MongoDB running locally on port 27017

## Start MongoDB
Make sure MongoDB is running before starting the app.
On Windows: start the MongoDB service or run `mongod` in a terminal.

## First time setup
Dependencies are already installed. To seed the database with sample sellers:

```
cd server
node seed.js
```

## Run the app

From the root folder:
```
npm run dev
```

This starts both:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

## Test seller login credentials (from seed data)
| Username | Password |
|---|---|
| priya_kitchen | priya123 |
| meera_crafts | meera123 |
| nisha_glow | nisha123 |
| kavita_boutique | kavita123 |
| anita_bakery | anita123 |

## Pages
- / — Buyer homepage, search and discover sellers
- /seller/:id — Seller detail page, place order
- /my-orders — Track orders by phone number
- /seller/login — Seller login
- /seller/register — New seller registration
- /dashboard — Seller overview
- /dashboard/orders — All orders with accept/reject
- /dashboard/pending — Pending orders only
- /dashboard/transactions — Transaction history
- /dashboard/earnings — Monthly earnings chart
- /dashboard/products — Manage product catalogue
