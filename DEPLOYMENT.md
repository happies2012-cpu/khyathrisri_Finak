# KSFOUNDATION Deployment Guide

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod

# Set environment variables
vercel env add DATABASE_URL "your-production-db-url"
vercel env add JWT_SECRET "your-production-jwt-secret"
```

### 2. Coolify (Alternative Static Hosting)
```bash
# Deploy frontend
npx coolify-cli deploy --dir dist

# Deploy backend Docker
coolify deploy --name ksfoundation-backend --docker
```

### 3. Dokploy (Docker Deployment)
```bash
# Build and deploy
dokploy deploy ksfoundation

# Configure domain
dokploy domain set your-domain.com
```

### 4. Railway (Backend as Service)
```bash
# Deploy backend
railway up

# Connect database
railway variables set DATABASE_URL "your-connection-string"
```

## 🔧 Environment Setup

### Required Variables
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-super-secure-secret"
APP_URL="https://your-domain.com"
API_URL="https://api.your-domain.com"
```

### Optional Variables
```bash
# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"

# Payment
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Monitoring
LOG_LEVEL=info
```

## 📊 Database Connection

### PostgreSQL Setup
```bash
# Test connection
npx prisma db pull

# Push schema
npx prisma db push

# Generate client
npx prisma generate
```

### Connection Test
```bash
# Health check
curl -f https://api.your-domain.com/health

# Database check
curl -f https://api.your-domain.com/health/db
```

## 🔐 Security Setup

### SSL Certificate
```bash
# Let's Encrypt (Free)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx" | sudo crontab -
```

### Firewall
```bash
# Open required ports
sudo ufw allow 80,443,3001

# Enable firewall
sudo ufw enable
```

## 📱 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificates obtained
- [ ] Build successful
- [ ] Health checks passing

### Post-Deployment
- [ ] Frontend accessible at domain
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] Monitoring configured
- [ ] Error logging active

---

**KSFOUNDATION Production Deployment Guide**
