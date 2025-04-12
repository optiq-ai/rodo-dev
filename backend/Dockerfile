FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3011
ENV PORT=3011
CMD ["npm", "start"]
