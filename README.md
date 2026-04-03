# Deployment Guide

This guide explains how to deploy the **VC1 Trip Booking App** on a **single AWS EC2 Ubuntu instance** with:

- **Frontend:** React + TypeScript + Vite
- **Backend:** Laravel + PHP-FPM
- **Database:** MySQL
- **Web server:** Nginx

This setup is good for a small production deployment, staging server, or portfolio/demo environment. Everything runs on one EC2 instance.

Live domain: `https://www.publicationweb.site/`

## 1. Deployment Architecture

The deployed server will host everything in one place:

- Nginx serves the built React frontend from `Frontend/dist`
- Nginx forwards `/api`, `/auth`, and `/sanctum` requests to Laravel
- Laravel runs through PHP-FPM
- MySQL runs on the same EC2 instance

Important project notes:

- The frontend is built to static files with `npm run build`
- The frontend expects `VITE_API_BASE_URL=/api`
- Laravel includes Google OAuth routes under `/auth/google/...`, so Nginx must forward `/auth` to Laravel
- This project still uses Laravel route closures, so **do not run `php artisan route:cache`** in production unless those closures are refactored first

## 2. Before You Start

Make sure you have:

- An **Ubuntu EC2 instance**
- A **security group** that allows:
  - `22` for SSH
  - `80` for HTTP
  - `443` for HTTPS if you add SSL later
- Your EC2 `.pem` key file
- Access to the GitHub repository:
  - `https://github.com/chantrea8888/VC1_trip_booking_app.git`

If you are using a domain name, point it to your EC2 public IP before configuring Nginx.

## 3. Domain Name Configuration

If you first deploy with an EC2 public IP and later move to a real domain such as `www.publicationweb.site`, you must update the app configuration in a few places.

### What should point to your domain

Update these values when your domain changes:

- Laravel `APP_URL`
- Laravel `FRONTEND_URLS`
- Laravel `SANCTUM_STATEFUL_DOMAINS`
- Laravel `GOOGLE_REDIRECT_URI`
- Frontend `VITE_BACKEND_ORIGIN`
- Frontend `VITE_ASSET_ORIGIN`
- Nginx `server_name`

### Example values

If you are using:

- Domain: `www.publicationweb.site`
- Protocol: `https`

Then your values should look like this:

```env
APP_URL=https://www.publicationweb.site
FRONTEND_URLS=https://www.publicationweb.site
SANCTUM_STATEFUL_DOMAINS=www.publicationweb.site
GOOGLE_REDIRECT_URI=https://www.publicationweb.site/auth/google/callback
VITE_BACKEND_ORIGIN=https://www.publicationweb.site
VITE_ASSET_ORIGIN=https://www.publicationweb.site
VITE_API_BASE_URL=/api
```

### DNS step

In your domain provider or DNS manager, create an `A` record:

- Host: `@` or your subdomain such as `app`
- Value: `YOUR_EC2_PUBLIC_IP`

You can verify DNS after saving:

```bash
nslookup www.publicationweb.site
```

### Backend domain settings

Open:

```bash
cd /var/www/VC1_trip_booking_app/Backend
nano .env
```

Use domain-based values like this:

```env
APP_URL=https://www.publicationweb.site
FRONTEND_URLS=https://www.publicationweb.site
SANCTUM_STATEFUL_DOMAINS=www.publicationweb.site
SESSION_DOMAIN=.publicationweb.site
SESSION_SECURE_COOKIE=true
GOOGLE_REDIRECT_URI=https://www.publicationweb.site/auth/google/callback
```

Notes:

- Use `SESSION_SECURE_COOKIE=true` only after HTTPS is enabled
- `SESSION_DOMAIN=.publicationweb.site` is useful if you later serve parts of the app from subdomains
- If you only use one domain and are unsure, you can leave `SESSION_DOMAIN=` empty

After updating the backend config:

```bash
php artisan optimize:clear
php artisan config:cache
```

### Frontend domain settings

Open:

```bash
cd /var/www/VC1_trip_booking_app/Frontend
nano .env
```

Use:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=https://www.publicationweb.site
VITE_ASSET_ORIGIN=https://www.publicationweb.site
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Then rebuild the frontend:

```bash
npm ci
npm run build
```

### Nginx domain settings

Open your Nginx site config:

```bash
sudo nano /etc/nginx/sites-available/vc1_trip_booking_app
```

Change:

```nginx
server_name YOUR_DOMAIN_OR_PUBLIC_IP;
```

To:

```nginx
server_name www.publicationweb.site;
```

Then test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Google OAuth domain settings

If Google login is enabled, make sure the callback URL in Google Cloud Console exactly matches:

```text
https://www.publicationweb.site/auth/google/callback
```

If this value does not match, Google login will fail even if the rest of the deployment is correct.

### Quick checklist when changing domain

When moving from IP to domain, update all of these:

- `Backend/.env`
- `Frontend/.env`
- `/etc/nginx/sites-available/vc1_trip_booking_app`
- Google Cloud OAuth redirect URL
- SSL certificate configuration if using HTTPS

After that, run:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan optimize:clear
php artisan config:cache

cd /var/www/VC1_trip_booking_app/Frontend
npm run build

sudo systemctl restart php8.3-fpm
sudo systemctl reload nginx
```

## 4. Connect to the EC2 Instance

From your local machine:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Explanation:

- `chmod 400` protects your SSH key so SSH will accept it
- `ubuntu` is the default user for Ubuntu EC2 images

## 5. Update the Server

Start from a clean server and install updates first:

```bash
sudo apt update && sudo apt upgrade -y
```

Explanation:

- This refreshes package lists and installs the latest security updates

## 6. Install System Dependencies

Install Nginx, Git, MySQL, PHP, Composer prerequisites, and build tools:

```bash
sudo apt install -y nginx mysql-server git curl unzip ca-certificates software-properties-common \
php-fpm php-cli php-mysql php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-intl
```

Install Composer:

```bash
cd /tmp
curl -sS https://getcomposer.org/installer -o composer-setup.php
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
composer --version
```

Install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Explanation:

- `nginx` serves the app
- `mysql-server` stores application data
- `php-fpm` runs Laravel with Nginx
- `composer` installs Laravel PHP dependencies
- `nodejs` and `npm` build the React frontend

## 7. Prepare MySQL

Run the MySQL security script:

```bash
sudo mysql_secure_installation
```

Create the application database and user:

```bash
sudo mysql
```

Then run:

```sql
CREATE DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'booking_user'@'localhost' IDENTIFIED BY 'ChangeThisStrongPassword!';
GRANT ALL PRIVILEGES ON booking_db.* TO 'booking_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Explanation:

- `booking_db` matches the Laravel default database name in this project
- A dedicated MySQL user is safer than using MySQL root from the app

## 8. Clone the Project

Create a web root and clone the repository:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/chantrea8888/VC1_trip_booking_app.git
cd VC1_trip_booking_app
```

Explanation:

- This guide uses `/var/www/VC1_trip_booking_app` as the project path

## 9. Set Up the Laravel Backend

Go to the backend directory and install dependencies:

```bash
cd /var/www/VC1_trip_booking_app/Backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
```

Open the backend environment file:

```bash
nano .env
```

Use values like these:

```env
APP_NAME="VC1 Trip Booking App"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://www.publicationweb.site

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booking_db
DB_USERNAME=booking_user
DB_PASSWORD=ChangeThisStrongPassword!

FRONTEND_URLS=https://www.publicationweb.site
SANCTUM_STATEFUL_DOMAINS=www.publicationweb.site
SESSION_DOMAIN=.publicationweb.site
SESSION_SECURE_COOKIE=false

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://www.publicationweb.site/auth/google/callback
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

Create the public storage symlink:

```bash
php artisan storage:link
```

Set writable permissions:

```bash
sudo chown -R www-data:www-data /var/www/VC1_trip_booking_app/Backend/storage
sudo chown -R www-data:www-data /var/www/VC1_trip_booking_app/Backend/bootstrap/cache
sudo chmod -R 775 /var/www/VC1_trip_booking_app/Backend/storage
sudo chmod -R 775 /var/www/VC1_trip_booking_app/Backend/bootstrap/cache
```

Explanation:

- `.env` tells Laravel how to connect to MySQL and what URL to use
- `key:generate` creates the app encryption key
- `storage:link` is required for uploaded files and public assets
- `storage` and `bootstrap/cache` must be writable by the web server

## 10. Import Data or Run Migrations

You have two common options.

### Option A: Import an existing MySQL dump

If you already have a database backup, copy it to the server first:

```bash
scp -i your-key.pem ./booking_db.sql ubuntu@YOUR_EC2_PUBLIC_IP:/tmp/booking_db.sql
```

Then import it on the server:

```bash
mysql -u booking_user -p booking_db < /tmp/booking_db.sql
```

Explanation:

- Use this option when you already have schema and data from another environment

### Option B: Create a fresh database from Laravel migrations

If you do not have a SQL dump, run migrations:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan migrate --force
```

If you want demo data as well:

```bash
php artisan db:seed --force
```

Important:

- The seeder creates demo users such as `admin@example.com`, `customer@example.com`, and `owner@example.com`
- Change or remove demo accounts before using this in real production

## 11. Optimize the Laravel App

Clear old cache and rebuild safe caches:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan optimize:clear
php artisan config:cache
php artisan view:cache
```

Explanation:

- This clears stale cache files and caches config/views for better performance
- Skip `php artisan route:cache` for this project because it still contains closure routes

## 12. Set Up the React Frontend

Go to the frontend directory:

```bash
cd /var/www/VC1_trip_booking_app/Frontend
cp .env.example .env
nano .env
```

Use values like these:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=https://www.publicationweb.site
VITE_ASSET_ORIGIN=https://www.publicationweb.site
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Install dependencies and build the production bundle:

```bash
npm ci
npm run build
```

Explanation:

- `VITE_API_BASE_URL=/api` matches the Nginx reverse proxy in this guide
- Do not set `VITE_API_BASE_URL=http://34.231.70.39/api` when the site is served from `https://www.publicationweb.site`, because the browser may block that request as mixed content and it also bypasses your same-origin Nginx proxy
- `VITE_BACKEND_ORIGIN` is important for backend-served images and Google login redirects
- The build output is generated in `Frontend/dist`

## 13. Configure Nginx

Create a new Nginx site config:

```bash
sudo tee /etc/nginx/sites-available/vc1_trip_booking_app > /dev/null <<'EOF'
server {
    listen 80;
    server_name www.publicationweb.site;

    root /var/www/VC1_trip_booking_app/Frontend/dist;
    index index.html;

    client_max_body_size 20M;

    # React frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Laravel public storage
    location /storage/ {
        alias /var/www/VC1_trip_booking_app/Backend/public/storage/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Send API, auth, and Sanctum traffic to Laravel
    location ~ ^/(api|auth|sanctum)(/.*)?$ {
        root /var/www/VC1_trip_booking_app/Backend/public;
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Laravel front controller
    location = /index.php {
        root /var/www/VC1_trip_booking_app/Backend/public;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/VC1_trip_booking_app/Backend/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/VC1_trip_booking_app/Backend/public;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/vc1_trip_booking_app /etc/nginx/sites-enabled/vc1_trip_booking_app
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

If the config test passes, reload Nginx:

```bash
sudo systemctl reload nginx
```

Explanation:

- `/` serves the React app
- `/api`, `/auth`, and `/sanctum` go to Laravel
- `/storage/` exposes Laravel public files such as uploaded images
- If your server installed a different PHP-FPM version, replace `php8.3-fpm.sock` with the correct socket from:

```bash
ls /run/php/
```

## 14. Start and Enable Services

Check the PHP-FPM service name:

```bash
systemctl list-units --type=service | grep php.*fpm
```

Restart services:

```bash
sudo systemctl restart mysql
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx
```

Enable services on boot:

```bash
sudo systemctl enable mysql
sudo systemctl enable php8.3-fpm
sudo systemctl enable nginx
```

Explanation:

- This makes sure the database, PHP-FPM, and Nginx start automatically after reboot
- Replace `php8.3-fpm` if your installed version is different

## 15. Verify the Deployment

Run these checks on the server:

```bash
curl http://127.0.0.1/api/health
```

Expected result:

- A JSON response showing the API is running
- Database connectivity should also be reported

Check service status:

```bash
sudo systemctl status nginx
sudo systemctl status php8.3-fpm
sudo systemctl status mysql
```

Open your browser and visit:

```text
https://www.publicationweb.site
```

You should see:

- The React frontend loading correctly
- API requests working through `/api`
- Laravel authentication routes such as Google OAuth available through `/auth/...`

## 16. Recommended Post-Deployment Steps

For a more production-ready server, do these next:

- Add HTTPS with Nginx and Certbot
- Update `APP_URL`, `FRONTEND_URLS`, `VITE_BACKEND_ORIGIN`, and `GOOGLE_REDIRECT_URI` to use `https://`
- Set `SESSION_SECURE_COOKIE=true` after HTTPS is enabled
- Disable or remove demo seed users
- Set up regular MySQL backups
- Use a process for future deployments, such as pulling from GitHub and rebuilding on release

## 17. Updating the Application Later

When you deploy new code later, this is the usual update flow:

```bash
cd /var/www/VC1_trip_booking_app
git pull origin main

cd /var/www/VC1_trip_booking_app/Backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan view:cache

cd /var/www/VC1_trip_booking_app/Frontend
npm ci
npm run build

sudo systemctl restart php8.3-fpm
sudo systemctl reload nginx
```

## 18. Common Issues and Troubleshooting

### 502 Bad Gateway

Cause:

- Nginx cannot reach PHP-FPM

Fix:

```bash
systemctl list-units --type=service | grep php.*fpm
ls /run/php/
sudo systemctl status php8.3-fpm
sudo journalctl -u php8.3-fpm --no-pager -n 50
```

Make sure the Nginx config uses the correct PHP-FPM socket.

### 500 Internal Server Error

Cause:

- Laravel `.env` is wrong
- Folder permissions are wrong
- Cache is stale

Fix:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan optimize:clear
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
tail -n 100 storage/logs/laravel.log
```

### Frontend loads but API requests fail

Cause:

- Nginx is not forwarding `/api` correctly
- MySQL is down
- Laravel environment values are incorrect

Fix:

```bash
curl http://127.0.0.1/api/health
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status mysql
```

Also confirm:

- `Frontend/.env` has `VITE_API_BASE_URL=/api`
- `Backend/.env` has the correct `DB_*` values

### Failed to reach API at `http://34.231.70.39/api`

If the frontend shows:

```text
Failed to reach API at http://34.231.70.39/api. Make sure the Laravel backend is running and CORS allows this origin.
```

This usually means one of these:

- The frontend was built with a hardcoded API URL pointing to the EC2 public IP
- The browser is blocking an `http://` API call from an `https://` website as mixed content
- Nginx is not forwarding `/api` to Laravel
- Laravel CORS settings do not include your frontend origin

For this project, the recommended production setup is:

- Frontend URL: `https://www.publicationweb.site`
- API base URL: `/api`
- Backend/public origin: `https://www.publicationweb.site`

Use these values:

```env
# Frontend/.env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=https://www.publicationweb.site
VITE_ASSET_ORIGIN=https://www.publicationweb.site
```

```env
# Backend/.env
APP_URL=https://www.publicationweb.site
FRONTEND_URLS=https://www.publicationweb.site
SANCTUM_STATEFUL_DOMAINS=www.publicationweb.site
GOOGLE_REDIRECT_URI=https://www.publicationweb.site/auth/google/callback
```

Then rebuild and reload everything:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan optimize:clear
php artisan config:cache

cd /var/www/VC1_trip_booking_app/Frontend
npm run build

sudo systemctl restart php8.3-fpm
sudo systemctl reload nginx
```

Quick checks:

```bash
curl http://127.0.0.1/api/health
curl -I https://www.publicationweb.site/api/health
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status php8.3-fpm
```

If `https://www.publicationweb.site/api/health` works but the browser still shows the error, rebuild the frontend again and make sure the deployed build does not contain `http://34.231.70.39/api`.

### Database connection errors

Cause:

- Wrong username/password
- Database was not imported
- `php-mysql` is missing

Fix:

```bash
mysql -u booking_user -p -e "SHOW DATABASES;"
cd /var/www/VC1_trip_booking_app/Backend
php artisan migrate:status
php -m | grep pdo_mysql
```

### Images or file uploads do not work

Cause:

- Missing storage symlink
- Wrong file permissions
- Wrong backend origin in frontend config

Fix:

```bash
cd /var/www/VC1_trip_booking_app/Backend
php artisan storage:link
sudo chown -R www-data:www-data storage bootstrap/cache public/storage
sudo chmod -R 775 storage bootstrap/cache public/storage
```

Also check:

- `Frontend/.env` has `VITE_BACKEND_ORIGIN=https://www.publicationweb.site`

### Google login fails or redirects incorrectly

Cause:

- `GOOGLE_REDIRECT_URI` does not match the URL configured in Google Cloud
- Nginx is not forwarding `/auth/...` to Laravel

Fix:

- Set the same callback URL in both places:
  - Laravel `.env`
  - Google Cloud Console

Example:

```text
https://www.publicationweb.site/auth/google/callback
```

### Nginx config changes do not apply

Fix:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
```

### Useful Log Commands

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
tail -f /var/www/VC1_trip_booking_app/Backend/storage/logs/laravel.log
sudo journalctl -u nginx -f
sudo journalctl -u php8.3-fpm -f
sudo journalctl -u mysql -f
```

## 19. Deployment Summary

After following this guide:

- React is built and served by Nginx
- Laravel runs through PHP-FPM
- MySQL is installed locally on the EC2 instance
- Nginx forwards `/api`, `/auth`, and `/sanctum` to Laravel
- The whole project runs on one Ubuntu EC2 server

If you later move to a larger production setup, the next step is usually to separate the database from the application server and add HTTPS, backups, and CI/CD.
