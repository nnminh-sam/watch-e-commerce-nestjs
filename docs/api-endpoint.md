# API Endpoints Documentation

This document provides a comprehensive list of all available API endpoints in the Watch E-commerce application.

## Authentication

### Sign In
- **Endpoint:** `POST /auth/sign-in`
- **Description:** Authenticate user and get access token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/auth/sign-in",
    "status": "success",
    "message": "Successfully signed in",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Status Codes:**
  - 200: Successful sign-in
  - 400: Invalid credentials

### Sign Up
- **Endpoint:** `POST /auth/sign-up`
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "MALE",
    "phoneNumber": "+84901234567",
    "dateOfBirth": "1995-08-15",
    "role": "CUSTOMER"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/auth/sign-up",
    "status": "success",
    "message": "Successfully registered",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Status Codes:**
  - 200: Successful sign-up
  - 400: Email or phone number has been taken

## Users

### Get User Profile
- **Endpoint:** `GET /users/my`
- **Description:** Get current user's profile
- **Authentication:** Required (JWT)
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/users/my",
    "status": "success",
    "message": "User profile retrieved successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "gender": "MALE",
      "phoneNumber": "+84901234567",
      "dateOfBirth": "1995-08-15",
      "role": "CUSTOMER"
    }
  }
  ```
- **Status Codes:**
  - 200: User profile retrieved successfully
  - 400: Invalid token

### Find Users
- **Endpoint:** `GET /users`
- **Description:** Get list of users (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Query Parameters:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "gender": "MALE",
    "dateOfBirth": "1995-08-15",
    "phoneNumber": "+84901234567",
    "role": "CUSTOMER",
    "page": 1,
    "size": 10,
    "sortBy": "createdAt",
    "orderBy": "asc"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/users",
    "status": "success",
    "message": "List of users retrieved successfully",
    "data": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "gender": "MALE",
        "phoneNumber": "+84901234567",
        "dateOfBirth": "1995-08-15",
        "role": "CUSTOMER"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "perPage": 10,
      "totalPages": 1
    }
  }
  ```
- **Status Codes:**
  - 200: List of users retrieved successfully
  - 403: Forbidden request

## Categories

### Create Category
- **Endpoint:** `POST /categories`
- **Description:** Create a new category (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:**
  ```json
  {
    "name": "Luxury Watches",
    "description": "High-end luxury timepieces"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/categories",
    "status": "success",
    "message": "Category created successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Luxury Watches",
      "description": "High-end luxury timepieces",
      "slug": "luxury-watches"
    }
  }
  ```
- **Status Codes:**
  - 201: Category created successfully
  - 400: Category name has been taken
  - 403: Forbidden request

### Get Category by Slug
- **Endpoint:** `GET /categories/slug/:slug`
- **Description:** Get category details by slug
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/categories/slug/luxury-watches",
    "status": "success",
    "message": "Category details retrieved",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Luxury Watches",
      "description": "High-end luxury timepieces",
      "slug": "luxury-watches"
    }
  }
  ```
- **Status Codes:**
  - 200: Category details retrieved
  - 404: Category not found

### List Categories
- **Endpoint:** `GET /categories`
- **Description:** Get list of categories
- **Query Parameters:**
  ```json
  {
    "name": "Luxury",
    "page": 1,
    "size": 10,
    "sortBy": "createdAt",
    "orderBy": "asc"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/categories",
    "status": "success",
    "message": "List of categories retrieved",
    "data": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Luxury Watches",
        "description": "High-end luxury timepieces",
        "slug": "luxury-watches"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "perPage": 10,
      "totalPages": 1
    }
  }
  ```
- **Status Codes:**
  - 200: List of categories retrieved
  - 404: Category not found

### Get Category by ID
- **Endpoint:** `GET /categories/:id`
- **Description:** Get category details by ID
- **Response:** `Category`
- **Status Codes:**
  - 200: Category details retrieved
  - 404: Category not found

### Update Category
- **Endpoint:** `PATCH /categories/:id`
- **Description:** Update a category (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:** `UpdateCategoryDto`
- **Response:** `Category`
- **Status Codes:**
  - 200: Category updated successfully
  - 400: Category name has been taken
  - 403: Forbidden request

### Delete Category
- **Endpoint:** `DELETE /categories/:id`
- **Description:** Delete a category (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Status Codes:**
  - 200: Category deleted successfully
  - 403: Forbidden request

## Brands

### Create Brand
- **Endpoint:** `POST /brands`
- **Description:** Create a new brand (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:** `CreateBrandDto`
- **Response:** `Brand`
- **Status Codes:**
  - 201: Brand created successfully
  - 400: Brand name has been taken
  - 403: Forbidden request

### Get Brand by Slug
- **Endpoint:** `GET /brands/slug/:slug`
- **Description:** Get brand details by slug
- **Response:** `Brand`
- **Status Codes:**
  - 200: Brand details retrieved
  - 404: Brand not found

### List Brands
- **Endpoint:** `GET /brands`
- **Description:** Get list of brands
- **Query Parameters:** `FindBrandDto`
- **Response:** Array of `Brand`
- **Status Codes:**
  - 200: List of brands retrieved

### Get Brand by ID
- **Endpoint:** `GET /brands/:id`
- **Description:** Get brand details by ID
- **Response:** `Brand`
- **Status Codes:**
  - 200: Brand details retrieved
  - 404: Brand not found

### Update Brand
- **Endpoint:** `PATCH /brands/:id`
- **Description:** Update a brand (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:** `UpdateBrandDto`
- **Response:** `Brand`
- **Status Codes:**
  - 200: Brand updated successfully
  - 400: Brand name has been taken
  - 403: Forbidden request

### Delete Brand
- **Endpoint:** `DELETE /brands/:id`
- **Description:** Delete a brand (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Status Codes:**
  - 200: Brand deleted successfully
  - 403: Forbidden request

## Products

### Create Product
- **Endpoint:** `POST /products`
- **Description:** Create a new product (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:**
  ```json
  {
    "name": "Luxury Watch",
    "spu": "LW12345",
    "sku": "LW12345-44MM-LEATHER",
    "description": "A high-end luxury watch",
    "price": 4999.99,
    "brandId": "60d21b4667d0d8992e610c85",
    "categoryIds": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
    "stock": 100,
    "sold": 50,
    "assets": ["image1.jpg", "image2.jpg"],
    "specs": [
      {
        "key": "Size",
        "options": ["44mm", "42mm"]
      }
    ],
    "status": "AVAILABLE",
    "customerVisible": true
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/products",
    "status": "success",
    "message": "Product created successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Luxury Watch",
      "spu": "LW12345",
      "sku": "LW12345-44MM-LEATHER",
      "description": "A high-end luxury watch",
      "price": 4999.99,
      "brandId": "60d21b4667d0d8992e610c85",
      "categoryIds": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
      "stock": 100,
      "sold": 50,
      "assets": ["image1.jpg", "image2.jpg"],
      "specs": [
        {
          "key": "Size",
          "options": ["44mm", "42mm"]
        }
      ],
      "status": "AVAILABLE",
      "customerVisible": true
    }
  }
  ```
- **Status Codes:**
  - 201: Product created successfully
  - 403: Forbidden request

### Update Product
- **Endpoint:** `PATCH /products/:id`
- **Description:** Update a product (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:**
  ```json
  {
    "name": "Updated Luxury Watch",
    "price": 4500,
    "stock": 80,
    "status": "AVAILABLE",
    "customerVisible": true
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/products/60d21b4667d0d8992e610c85",
    "status": "success",
    "message": "Product updated successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Updated Luxury Watch",
      "price": 4500,
      "stock": 80,
      "status": "AVAILABLE",
      "customerVisible": true
    }
  }
  ```
- **Status Codes:**
  - 200: Product updated successfully
  - 403: Forbidden request
  - 404: Product not found

## Cart

### Get Cart
- **Endpoint:** `GET /carts`
- **Description:** Get current user's cart
- **Authentication:** Required (JWT)
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/carts",
    "status": "success",
    "message": "Cart retrieved successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "userId": "60d21b4667d0d8992e610c86",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c87",
          "quantity": 1,
          "price": 4999.99
        }
      ],
      "total": 4999.99
    }
  }
  ```
- **Status Codes:**
  - 200: Cart retrieved successfully

### Add to Cart
- **Endpoint:** `POST /carts`
- **Description:** Add item to cart
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "productId": "60d21b4667d0d8992e610c87",
    "quantity": 1
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/carts",
    "status": "success",
    "message": "Item added to cart successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "userId": "60d21b4667d0d8992e610c86",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c87",
          "quantity": 1,
          "price": 4999.99
        }
      ],
      "total": 4999.99
    }
  }
  ```
- **Status Codes:**
  - 201: Item added to cart successfully

### Update Cart Item
- **Endpoint:** `PATCH /carts/:id`
- **Description:** Update cart item quantity
- **Authentication:** Required (JWT)
- **Request Body:** `UpdateCartDetailDto`
- **Response:** `Cart`
- **Status Codes:**
  - 200: Cart item updated successfully

### Delete Cart Item
- **Endpoint:** `DELETE /carts/:id`
- **Description:** Remove item from cart
- **Authentication:** Required (JWT)
- **Status Codes:**
  - 200: Item removed successfully

## Orders

### Create Order
- **Endpoint:** `POST /orders`
- **Description:** Create a new order
- **Authentication:** Required (JWT)
- **Request Body:**
  ```json
  {
    "cartDetailIds": ["60d21b4667d0d8992e610c87"],
    "paymentMethod": "CASH",
    "fullName": "John Doe",
    "phoneNumber": "+84123456789",
    "city": "Ho Chi Minh City",
    "district": "District 1",
    "street": "Nguyen Hue Street",
    "specificAddress": "123A, Floor 3, Sunrise City Apartment"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/orders",
    "status": "success",
    "message": "Order created successfully",
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "orderNumber": "ORD123456",
      "userId": "60d21b4667d0d8992e610c86",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c87",
          "quantity": 1,
          "price": 4999.99
        }
      ],
      "total": 4999.99,
      "status": "PENDING",
      "paymentMethod": "CASH",
      "deliveryInfo": {
        "fullName": "John Doe",
        "phoneNumber": "+84123456789",
        "city": "Ho Chi Minh City",
        "district": "District 1",
        "street": "Nguyen Hue Street",
        "specificAddress": "123A, Floor 3, Sunrise City Apartment"
      }
    }
  }
  ```
- **Status Codes:**
  - 201: Order created successfully

### Get Orders
- **Endpoint:** `GET /orders`
- **Description:** Get list of orders
- **Authentication:** Required (JWT)
- **Query Parameters:**
  ```json
  {
    "userId": "60d21b4667d0d8992e610c86",
    "orderNumber": "ORD123456",
    "fromDate": "2024-03-01",
    "toDate": "2024-03-20",
    "status": "PENDING",
    "paymentMethod": "CASH",
    "page": 1,
    "size": 10,
    "sortBy": "createdAt",
    "orderBy": "asc"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/orders",
    "status": "success",
    "message": "Orders retrieved successfully",
    "data": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "orderNumber": "ORD123456",
        "userId": "60d21b4667d0d8992e610c86",
        "items": [
          {
            "productId": "60d21b4667d0d8992e610c87",
            "quantity": 1,
            "price": 4999.99
          }
        ],
        "total": 4999.99,
        "status": "PENDING",
        "paymentMethod": "CASH",
        "deliveryInfo": {
          "fullName": "John Doe",
          "phoneNumber": "+84123456789",
          "city": "Ho Chi Minh City",
          "district": "District 1",
          "street": "Nguyen Hue Street",
          "specificAddress": "123A, Floor 3, Sunrise City Apartment"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "perPage": 10,
      "totalPages": 1
    }
  }
  ```
- **Status Codes:**
  - 200: Orders retrieved successfully

### Update Order Status
- **Endpoint:** `PATCH /orders/:id`
- **Description:** Update order status (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:** `OrderStatusEnum`
- **Response:** `Order`
- **Status Codes:**
  - 200: Order status updated successfully
  - 403: Forbidden request

## Transactions

### Get Transactions
- **Endpoint:** `GET /transactions`
- **Description:** Get list of transactions
- **Authentication:** Required (JWT)
- **Query Parameters:**
  ```json
  {
    "userId": "60d21b4667d0d8992e610c86",
    "orderId": "60d21b4667d0d8992e610c85",
    "status": "COMPLETED",
    "minAmount": 1000,
    "maxAmount": 5000,
    "paymentMethod": "CASH",
    "page": 1,
    "size": 10,
    "sortBy": "createdAt",
    "orderBy": "asc"
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/transactions",
    "status": "success",
    "message": "Transactions retrieved successfully",
    "data": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "orderId": "60d21b4667d0d8992e610c86",
        "amount": 4999.99,
        "status": "COMPLETED",
        "paymentMethod": "CASH"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "perPage": 10,
      "totalPages": 1
    }
  }
  ```
- **Status Codes:**
  - 200: Transactions retrieved successfully

## File Upload

### Upload Files
- **Endpoint:** `POST /files`
- **Description:** Upload files to cloud storage
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:** Multipart form data
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/files",
    "status": "success",
    "message": "Files uploaded successfully",
    "data": {
      "trackingId": "60d21b4667d0d8992e610c85",
      "state": "COMPLETED",
      "message": "Files uploaded successfully"
    }
  }
  ```
- **Status Codes:**
  - 201: Files uploaded successfully
  - 403: Forbidden request

## Email

### Send Test Email
- **Endpoint:** `POST /emails`
- **Description:** Send a test email (Admin/Employee only)
- **Authentication:** Required (JWT)
- **Authorization:** ADMIN or EMPLOYEE role
- **Request Body:**
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Test Email",
    "template": "<h1>Hello World</h1>",
    "context": {
      "name": "John Doe"
    }
  }
  ```
- **Response:**
  ```json
  {
    "timestamp": "2024-03-20T12:00:00.000Z",
    "path": "/api/v1/emails",
    "status": "success",
    "message": "Email sent successfully",
    "data": {
      "trackingId": "60d21b4667d0d8992e610c85",
      "state": "SENT",
      "message": "Email sent successfully"
    }
  }
  ```
- **Status Codes:**
  - 200: Email sent successfully
  - 403: Forbidden request 