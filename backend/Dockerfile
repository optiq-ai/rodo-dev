FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install ws --save

COPY . .

EXPOSE ${BACKEND_PORT}
ENV PORT=${BACKEND_PORT}
CMD ["npm", "start"]
