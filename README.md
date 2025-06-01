# Watch E-commerce Platform

A modern e-commerce platform built with NestJS, designed specifically for watch retailers and enthusiasts. This platform provides a robust backend system with features for product management, user authentication, order processing, and more.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - Secure password handling with bcrypt

- **Product Management**
  - Product catalog with detailed specifications
  - Image processing and optimization
  - Cloud storage integration with Cloudinary

- **Order Processing**
  - Order management system
  - Payment processing
  - Order status tracking

- **Background Jobs**
  - Queue management with Bull/BullMQ
  - Email notifications
  - Asynchronous task processing

- **API Documentation**
  - Swagger/OpenAPI integration
  - Comprehensive API documentation

## 🛠 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **Queue:** Bull/BullMQ
- **Email:** Nodemailer
- **Image Processing:** Sharp
- **Authentication:** Passport.js
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston
- **Testing:** Jest

## 📋 Prerequisites

- Node.js (Latest LTS version)
- Docker and Docker Compose
- MongoDB
- Redis

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd watch-e-commerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_PORT=27017
   DATABASE_NAME=watch_ecommerce
   REDIS_PORT=6379
   PORT=3000
   ```

4. **Start the development environment**
   ```bash
   # Start MongoDB and Redis using Docker
   docker-compose up -d

   # Start the application in development mode
   npm run start:dev
   # or
   yarn start:dev
   ```

## 🏗 Project Structure

```
watch-e-commerce/
├── src/                    # Source code
├── test/                   # Test files
├── docs/                   # Documentation
├── templates/             # Email templates
├── uploads/               # File uploads
├── docker-volumes/        # Docker persistent volumes
└── dist/                  # Compiled output
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker Support

The project includes Docker configuration for easy deployment:

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose-production.yml up -d
```

## 📝 API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-document
```

## 🔐 Environment Variables

The following environment variables are required:

- `DATABASE_PORT`: MongoDB port
- `DATABASE_NAME`: MongoDB database name
- `REDIS_PORT`: Redis port
- `PORT`: Application port
- Additional variables for email, cloud storage, and other services

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 👥 Authors

- Nguyễn Nhật Minh - Initial work
- Trần Vũ Phương Nam - Developer
- Đàm Tuấn Phát - Developer
