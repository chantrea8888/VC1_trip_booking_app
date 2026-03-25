# Stage 1: Composer dependencies
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# Stage 2: Production image
FROM php:8.3-fpm-alpine

RUN apk add --no-cache nginx supervisor \
    && docker-php-ext-install pdo pdo_mysql opcache redis

WORKDIR /var/www/html
COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

COPY docker/nginx/laravel.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"] 