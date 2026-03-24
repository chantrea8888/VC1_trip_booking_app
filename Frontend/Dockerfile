FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Use nginx to serve React
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]