# Sử dụng image node chính thức
FROM node:20-alpine AS builder

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và yarn.lock vào container
COPY package.json yarn.lock ./

# Cài đặt các dependencies
RUN yarn install --frozen-lockfile --network-timeout 600000

# Sao chép tất cả các tệp của dự án vào container
COPY . .

# Build ứng dụng Next.js
RUN yarn build

# Dùng image nhỏ hơn để chạy ứng dụng sau khi build
FROM node:20-alpine AS runner

# Đặt biến môi trường NODE_ENV là 'production'
ENV NODE_ENV=production

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các tệp cần thiết từ quá trình build trước
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Lắng nghe trên cổng 3030
EXPOSE 3030

# Lệnh chạy ứng dụng Next.js
CMD ["yarn", "start"]
