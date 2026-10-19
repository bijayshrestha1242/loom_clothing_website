# Loom Clothing Website

Loom is a clothing store website developed as a university team project. Customers can browse clothing, manage a shopping cart and place orders. A separate admin dashboard supports product and order management.

## Features

### Customers

- Register an account and log in.
- Browse men's and women's clothing.
- Filter products by price, size, colour and availability.
- Add products to the cart and adjust quantities.
- Select delivery or click-and-collect.
- Apply discount codes.
- Place orders and view order history.
- View and submit product reviews.

### Admin

- Sign in through a separate admin login page.
- Add, edit and remove products.
- View orders and update their status.
- View customer records.
- Manage discount codes.

## Technologies

| Technology | Purpose |
|---|---|
| HTML | Page structure |
| CSS | Styling and responsive layouts |
| JavaScript | Frontend interaction and requests to Flask |
| Python and Flask | Backend routes, authentication and order processing |
| SQLite | Product, account and order storage |
| localStorage | Cart persistence and recent order confirmation details |
| JSON files | Discount codes and product reviews |

## Running Locally

Python 3, pip and Git are required.

### 1. Clone the repository

```bash
git clone https://github.com/bijayshrestha1242/loom_clothing_website.git
cd loom_clothing_website
```


The default working branch is `loom-updated`.

### 2. Install Flask

```bash
python -m pip install flask
```

### 3. Start the application

```bash
python app.py
```


### 4. Open the website

Visit:

http://127.0.0.1:5000/homepage.html

Keep the terminal running while using the website. Press Ctrl+C to stop the server.

Use the Flask address rather than Live Server or opening HTML files directly. Database features require Flask.

## Main Files

| File | Purpose |
|---|---|
| app.py | Flask application and database operations |
| Loom.db | SQLite database |
| script.js | Frontend functionality |
| style.css | Shared website styling |
| homepage.html | Homepage |
| mens_clothing.html | Men's product catalogue |
| womens_clothing.html | Women's product catalogue |
| register.html | Customer registration |
| login.html | Customer login |
| checkout.html | Checkout page |
| confirmation.html | Order confirmation |
| order_history.html | Customer order history |
| admin_login.html | Admin login |
| admin_page.html | Admin dashboard |
| discounts.json | Discount code data |
| reviews.json | Product review data |

## Database and Cart

Products are loaded from Loom.db through Flask. Customer accounts and placed orders are also stored in the database.

The cart is stored in browser localStorage, allowing items to remain when moving between pages or refreshing.

Customers must log in before placing an order.

Keep Loom.db beside app.py. Back up the database before changing its structure. The database schema must match the queries in app.py, including the product_id column used in order_items.

## Admin Access

With Flask running, open:

http://127.0.0.1:5000/admin_login.html

An existing admin account is required. Contact the project team for access. Do not publish admin passwords.

## Checking the System

1. Register a test customer account.
2. Log in.
3. Open the men's or women's catalogue.
4. Add products and adjust cart quantities.
5. Open checkout and select delivery and payment options.
6. Place a test order using dummy payment details.
7. Check the confirmation page and My Orders.
8. Log in as an admin and check the order.


## Limitations

- The website is an educational prototype.
- Payments are simulated; no real payments are processed.
- Use dummy payment details during testing.
- Some size, colour and availability filters use predefined JavaScript values rather than database-managed variants.
- Product images use external URLs and may become unavailable.
- The Flask development server is intended for local testing.
- Further security, validation and testing are needed before public deployment.

## Future Improvements

- Manage product sizes, colours and stock through the database.
- Support image updates through the product editing form.
- Improve checkout validation and error messages.
- Add automated tests for registration, checkout and order management.
- Integrate a payment provider using its test environment.
- Prepare the application for hosted deployment.
