FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

RUN npm run build
RUN npm prune --production
CMD ["npm", "run", "start"]
