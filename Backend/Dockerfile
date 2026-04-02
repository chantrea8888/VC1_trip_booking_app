# Stage 1: Composer dependencies
FROM composer:2 AS vendor
WORKDIR /app
COPY Backend/composer.json Backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs
COPY Backend/ .
RUN composer dump-autoload --optimize

# Stage 2: Production image
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    zip \
    unzip \
    supervisor

# Install built-in PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    zip \
    gd \
    opcache

# Install Redis via PECL (not a built-in extension)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Set working directory
WORKDIR /var/www/Backend

# Copy app files
COPY Backend/ .

# Copy vendor from stage 1
COPY --from=vendor /app/vendor ./vendor

# Set permissions
RUN chown -R www-data:www-data /var/www/Backend \
    && chmod -R 755 /var/www/Backend/storage \
    && chmod -R 755 /var/www/Backend/bootstrap/cache

# Expose PHP-FPM port
EXPOSE 9000

CMD ["php-fpm"]