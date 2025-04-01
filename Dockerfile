
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN yarn install 

COPY . .

RUN yarn build

EXPOSE 3030

CMD ["yarn", "start"]
