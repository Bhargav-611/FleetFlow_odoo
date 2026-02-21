# 🚀 FleetFlow Deployment Guide

## Overview
Complete guide for deploying FleetFlow to production environments (AWS, Azure, GCP, or self-hosted).

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] No console errors in frontend
- [ ] No API errors in backend
- [ ] Environment variables configured for production
- [ ] MongoDB Atlas or self-hosted MongoDB setup
- [ ] JWT_SECRET set to strong random string
- [ ] CORS configured for production domain
- [ ] SSL/TLS certificates obtained
- [ ] Backup strategy documented
- [ ] Monitoring and logging setup
- [ ] Rate limiting configured
- [ ] Security headers configured

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Cloud)

1. **Create Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Create Deployment"
   - Choose "M0 Sandbox" (free tier)
   - Select cloud provider (AWS, Azure, GCP)
   - Choose region closest to users

3. **Get Connection String**
   - Click "Connect" button
   - Select "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/fleetflow?retryWrites=true&w=majority`

4. **Create Database User**
   - Go to Database Access
   - Add Database User
   - Generate secure password
   - Copy username and password

5. **Whitelist IP Addresses**
   - Go to Network Access
   - Add IP Address
   - For development: Add your IP
   - For production: Add server IP only

### Option 2: Self-Hosted MongoDB

```bash
# Ubuntu/Debian
curl -fsSL https://pgp.mongodb.com/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# CentOS/RHEL
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## 🔐 Environment Configuration

### Create Production .env Files

**server/.env.production**
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fleetflow?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_random_key_here_min_32_chars_$@3#!
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Email (Optional for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@fleetflow.com

# AWS S3 (Optional for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=fleetflow-prod

# Logging
LOG_LEVEL=info
```

**Generate Strong JWT_SECRET**
```bash
# macOS/Linux
openssl rand -base64 32

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Max 256)}))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| MONGODB_URI | Database connection | mongodb+srv://... |
| JWT_SECRET | Token encryption key | 64-char random string |
| JWT_EXPIRE | Token expiration time | 7d (7 days) |
| PORT | Server port | 5000 |
| NODE_ENV | Environment type | production |
| CORS_ORIGIN | Allowed frontend origin | https://app.fleetflow.com |
| SMTP_HOST | Email server | smtp.gmail.com |
| LOG_LEVEL | Logging verbosity | info, debug, error |

---

## 🌐 Deployment Platforms

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Deploy Backend

```bash
# 1. Login to Heroku
heroku login

# 2. Create Heroku app
cd server
heroku create fleetflow-api

# 3. Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://yourdomain.com

# 4. Deploy
git push heroku main

# 5. Check logs
heroku logs --tail

# 6. Get app URL
heroku apps:open
```

**Backend will be available at**: `https://fleetflow-api.herokuapp.com`

#### Deploy Frontend

```bash
# Option A: Deploy to Vercel (Recommended for React)
npm install -g vercel
cd client
vercel --prod

# Option B: Deploy to Netlify
npm install -g netlify-cli
cd client
netlify deploy --prod --dir=dist

# Option C: Deploy to GitHub Pages
# Update vite.config.js:
export default {
  base: '/fleetflow/',
}
```

---

### Option 2: AWS EC2 + Elastic Beanstalk

#### Backend Setup

```bash
# 1. Create Elastic Beanstalk environment
eb create fleetflow-api --instance-type t3.micro

# 2. Set environment variables
eb setenv MONGODB_URI="mongodb+srv://..." NODE_ENV=production

# 3. Deploy
eb deploy

# 4. View logs
eb logs

# 5. Open application
eb open
```

#### Frontend Setup (S3 + CloudFront)

```bash
# 1. Build frontend
cd client
npm run build

# 2. Create S3 bucket
aws s3 mb s3://fleetflow-frontend --region us-east-1

# 3. Upload files
aws s3 sync dist/ s3://fleetflow-frontend --delete

# 4. Create CloudFront distribution
# - Origin: S3 bucket
# - CNAME: app.fleetflow.com
# - SSL: Use ACM certificate
```

---

### Option 3: Docker + Container Registry

#### Create Dockerfile

**server/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

**client/Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose for Local Testing

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/fleetflow
      JWT_SECRET: test-secret-key-only-for-development
      NODE_ENV: production
    depends_on:
      - mongodb
    volumes:
      - ./server:/app
      - /app/node_modules

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

#### Deploy to Docker Hub

```bash
# 1. Build images
docker build -t yourusername/fleetflow-api:1.0 ./server
docker build -t yourusername/fleetflow-web:1.0 ./client

# 2. Login to Docker Hub
docker login

# 3. Push images
docker push yourusername/fleetflow-api:1.0
docker push yourusername/fleetflow-web:1.0

# 4. Pull and run on production server
docker pull yourusername/fleetflow-api:1.0
docker pull yourusername/fleetflow-web:1.0
docker-compose up -d
```

---

### Option 4: DigitalOcean App Platform

```bash
# 1. Create app.yaml
cat > app.yaml << EOF
name: fleetflow

services:
- name: api
  github:
    branch: main
    repo: your-github/fleetflow
  build_command: npm install
  run_command: npm start
  envs:
  - key: MONGODB_URI
    value: mongodb+srv://...
  - key: JWT_SECRET
    value: your_secret
  http_port: 5000

- name: web
  github:
    branch: main
    repo: your-github/fleetflow
  build_command: cd client && npm install && npm run build
  http_port: 80
EOF

# 2. Deploy
doctl apps create --spec app.yaml

# 3. View logs
doctl apps logs <app-id>
```

---

## 🎯 Production Best Practices

### 1. Security

```javascript
// server/src/index.js - Security headers
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body size limit
app.use(express.json({ limit: '10mb' }));
```

### 2. Logging

```javascript
// server/src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 3. Database Backups

```bash
# Automated backup script (backup.sh)
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

# Upload to S3 (optional)
aws s3 sync $BACKUP_DIR s3://fleetflow-backups/
```

```bash
# Add to crontab for daily backup at 2 AM
0 2 * * * /usr/local/bin/backup.sh
```

### 4. Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start application
cd server
pm2 start npm --name "fleetflow-api" -- start

# Setup restart on reboot
pm2 startup
pm2 save

# Monitor real-time
pm2 monit

# View logs
pm2 logs fleetflow-api
```

### 5. SSL/TLS Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d app.fleetflow.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 🔍 Post-Deployment Verification

### Health Check Endpoint

```javascript
// server/src/routes/health.routes.js
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});
```

### Monitor Endpoint

```bash
# Check backend health
curl https://api.fleetflow.com/api/v1/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-02-21T10:30:00Z",
#   "environment": "production"
# }
```

### Frontend Health Check

```bash
# Check frontend is loading
curl -I https://app.fleetflow.com

# Expected: HTTP/1.1 200 OK
```

---

## 📊 Performance Optimization

### Backend Optimization

```javascript
// Enable gzip compression
const compression = require('compression');
app.use(compression());

// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Cache vehicle list
router.get('/vehicles', async (req, res) => {
  const cacheKey = `vehicles_${req.query.page}_${req.query.limit}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const vehicles = await Vehicle.find(...);
  client.setex(cacheKey, 3600, JSON.stringify(vehicles)); // Cache for 1 hour
  res.json(vehicles);
});
```

### Frontend Optimization

```javascript
// client/vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-router-dom'],
          'ui': ['@shadcn/ui', 'recharts']
        }
      }
    },
    minify: 'terser',
    sourcemap: false // Disable for production
  }
}
```

### CDN Configuration

```nginx
# nginx.conf - Cache static assets
location ~* \.(jpg|jpeg|png|gif|css|js|woff|woff2)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies (Backend)
        run: cd server && npm ci
      
      - name: Run tests (Backend)
        run: cd server && npm test
      
      - name: Install dependencies (Frontend)
        run: cd client && npm ci
      
      - name: Build frontend
        run: cd client && npm run build
      
      - name: Deploy to Heroku (Backend)
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: fleetflow-api
          userPlaintext: fleetflow
          appdir: server
      
      - name: Deploy to Vercel (Frontend)
        run: npx vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📋 Rollback Procedure

### If Deployment Fails

```bash
# Heroku rollback
heroku releases
heroku rollback v123

# Docker rollback
docker stop fleetflow-api
docker run -d --name fleetflow-api yourusername/fleetflow-api:1.0-stable

# Git rollback
git revert HEAD
git push heroku main
```

---

## 🚨 Troubleshooting Deployment

### Issue: Database Connection Fails
```
Error: MongoServerSelectionError
```
**Solution**:
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string format
# Test connection: mongo "your_connection_string"
```

### Issue: CORS Error in Production
```
Access to XMLHttpRequest blocked
```
**Solution**:
```bash
# Update CORS_ORIGIN in backend
# Ensure frontend domain matches exactly
# Check for www vs non-www mismatch
```

### Issue: Frontend Blank Page
```
Blank white screen on production
```
**Solution**:
```bash
# Check browser console for errors
# Verify API base URL in frontend
# Check VITE_API_URL environment variable
```

### Issue: Out of Memory
```
FATAL ERROR: Ineffective mark-compacts
```
**Solution**:
```bash
# Increase Node.js memory
node --max-old-space-size=2048 server.js

# Or update Procfile for Heroku
web: node --max-old-space-size=512 src/index.js
```

---

## 📱 Domain & DNS Setup

### Configure Domain DNS Records

**For subdomain (api.fleetflow.com, app.fleetflow.com)**

1. Go to DNS provider (GoDaddy, Namecheap, etc.)
2. Add DNS records:

| Type | Name | Value |
|------|------|-------|
| A | app | IP_ADDRESS_OF_SERVER |
| CNAME | api | fleetflow-api.herokuapp.com |
| MX | @ | mail.yourmailprovider.com |
| TXT | @ | v=spf1... (SPF record) |

### Test DNS Resolution

```bash
nslookup app.fleetflow.com
# Should return your server IP

nslookup api.fleetflow.com
# Should return Heroku dyno IP
```

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database backups configured
- [ ] SSL certificate installed
- [ ] DNS records point to servers
- [ ] Frontend loads without errors
- [ ] API responds to health check
- [ ] Database queries respond quickly
- [ ] File uploads working
- [ ] Email notifications working (if enabled)
- [ ] Monitoring and alerts configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Admin user created
- [ ] Logging configured
- [ ] Backup and recovery tested

---

## 📞 Support & Monitoring Links

- **Heroku Dashboard**: https://dashboard.heroku.com
- **MongoDB Atlas**: https://account.mongodb.com
- **AWS Console**: https://console.aws.amazon.com
- **DigitalOcean**: https://cloud.digitalocean.com
- **Vercel**: https://vercel.com/dashboard
- **Netlify**: https://app.netlify.com

---

Last Updated: February 21, 2026
