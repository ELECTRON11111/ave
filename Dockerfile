FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build  # Build the Next.js application

EXPOSE 3000

CMD ["npm","run", "start"]
