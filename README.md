# Welcome to your Lovable project

## Project info


# KSFOUNDATION - Professional Hosting Platform

A production-ready hosting platform built with modern web technologies, providing comprehensive domain management, VPS hosting, and cloud services.

## 🚀 Features

### Core Platform
- **Modern UI**: React 18 + TypeScript + Tailwind CSS
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for efficient state handling
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Components**: Radix UI + shadcn/ui components

### Backend Services
- **API**: Express.js with comprehensive REST endpoints
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + OAuth (Google, GitHub)
- **Security**: Rate limiting, CORS, helmet protection
- **Logging**: Winston for structured logging
- **Validation**: Express-validator for input validation

### Hosting Features
- **VPS Hosting**: Scalable virtual private servers
- **Domain Management**: Complete domain registration and management
- **WordPress Hosting**: Optimized WordPress environments
- **Cloud Hosting**: Enterprise-grade cloud infrastructure
- **SSL Security**: Free SSL certificates
- **DDoS Protection**: Advanced security measures

### Admin Panel
- **User Management**: Complete CRUD operations
- **Role-Based Access**: USER, ADMIN, SUPER_ADMIN roles
- **Analytics**: System statistics and monitoring
- **Support System**: Ticket management and replies
- **Billing**: Invoice and subscription management

## 🛠 Tech Stack

### Frontend
- **React**: 18.2.0 with TypeScript
- **Vite**: 5.4.19 for fast development
- **Tailwind CSS**: 3.4.0 for styling
- **Framer Motion**: 10.16.4 for animations
- **Zustand**: 4.4.7 for state management
- **React Router**: 6.20.1 for navigation
- **React Hook Form**: 7.48.2 for forms
- **Zod**: 3.22.4 for validation
- **Recharts**: 2.8.0 for charts
- **Lucide React**: 0.294.0 for icons

### Backend
- **Node.js**: 18.18.0
- **Express**: 4.18.2
- **Prisma**: 7.2.0 ORM
- **PostgreSQL**: 15+ database
- **JWT**: jsonwebtoken for authentication
- **bcryptjs**: 2.4.3 for password hashing
- **Winston**: 3.11.0 for logging
- **Express-validator**: 7.0.1 for validation

### Deployment
- **Docker**: Multi-service containerization
- **Nginx**: Reverse proxy with security
- **GitHub Actions**: CI/CD pipeline ready
- **Environment**: Production-ready configuration

## 📁 Project Structure

```
khyathiSriFinal/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── animations/          # Animation components
│   │   ├── auth/               # Authentication components
│   │   ├── cart/               # Shopping cart components
│   │   └── ui/                 # Base UI components
│   ├── pages/                    # Page components
│   ├── stores/                   # Zustand stores
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API service functions
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── server/                       # Backend source code
│   ├── middleware/                # Express middleware
│   ├── routes/                   # API route handlers
│   ├── utils/                    # Server utilities
│   └── index.ts                  # Server entry point
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── docker-compose.yml             # Docker services
├── Dockerfile                    # Container configuration
└── nginx.conf                    # Nginx configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/happies2012-cpu/khyathrisri_Finak.git
cd khyathrisri_Finak
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# Database URL, JWT secrets, OAuth keys, etc.
```

4. **Database setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push
```

5. **Start development servers**
```bash
# Start frontend (port 5173)
npm run dev

# Start backend (port 3001) - in separate terminal
npm run server:dev
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📊 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run dev:https` - Start with HTTPS
- `npm run dev:insecure` - Start without host checks
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Backend
- `npm run server:dev` - Start development server
- `npm run server` - Start production server
- `npm run test` - Run backend tests

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hosting_platform"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# OAuth (Google, GitHub)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
APP_URL="http://localhost:5173"
API_URL="http://localhost:3001"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payment (Stripe)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Users (Admin)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - User statistics

### Hosting
- `GET /api/hosting` - Get user hosting accounts
- `POST /api/hosting` - Create hosting account
- `PUT /api/hosting/:id` - Update hosting account
- `DELETE /api/hosting/:id` - Delete hosting account
- `GET /api/hosting/stats` - Hosting statistics

### Domains
- `GET /api/domains` - Get user domains
- `POST /api/domains` - Register domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain
- `POST /api/domains/:id/transfer` - Transfer domain

### Orders & Billing
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/billing/invoices` - Get invoices
- `GET /api/billing/subscriptions` - Get subscriptions

### Support
- `GET /api/support` - Get support tickets
- `POST /api/support` - Create support ticket
- `POST /api/support/:id/reply` - Reply to ticket
- `PUT /api/support/:id` - Update ticket status

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/support` - Manage support tickets
- `PUT /api/admin/settings` - Update system settings

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse and DDoS
- **CORS Protection**: Cross-origin resource sharing
- **Input Validation**: Comprehensive input sanitization
- **Password Hashing**: bcrypt for secure password storage
- **Security Headers**: Helmet.js for HTTP security
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Content Security Policy headers

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Development Setup
For cross-platform development compatibility:

1. **Chrome**: Enable `chrome://flags/#allow-insecure-localhost`
2. **Firefox**: Set `security.fileuri.strict_origin_policy` to false
3. **Safari**: Enable Develop menu in Preferences
4. **Edge**: Use `--disable-web-security` flag

See `BROWSER_COMPATIBILITY.md` for detailed setup instructions.

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export JWT_SECRET="production-secret"
```

2. **Database Migration**
```bash
npx prisma db push
npx prisma generate
```

3. **Build Application**
```bash
# Build frontend
npm run build

# Build backend
cd server && npm run build
```

4. **Docker Deployment**
```bash
# Build and start containers
docker-compose up -d --build

# Scale services if needed
docker-compose up -d --scale frontend=2
```

### Cloud Deployment

The application is ready for deployment to:
- **AWS**: ECS, EKS, or EC2 with Docker
- **Google Cloud**: Cloud Run or GKE
- **Azure**: Container Instances or AKS
- **DigitalOcean**: App Platform or Droplets
- **Heroku**: Container stack

## 🧪 Testing

### Frontend Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Backend Tests
```bash
cd server

# Run API tests
npm run test

# Run integration tests
npm run test:integration
```

## 📈 Performance

### Frontend Optimization
- **Code Splitting**: Dynamic imports for reduced bundle size
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: WebP format support
- **Caching**: Service worker for offline support
- **Lazy Loading**: Component and route lazy loading

### Backend Performance
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for session and data caching
- **Compression**: Gzip response compression
- **Rate Limiting**: API protection and performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the FAQ in the repository wiki

---

**Built with ❤️ by KSFOUNDATION Team**
