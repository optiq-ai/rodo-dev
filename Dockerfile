FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${FRONTEND_PORT}
ENV PORT=${FRONTEND_PORT}
CMD ["npm", "start"]
