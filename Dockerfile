FROM node:latest

RUN mkdir ~/app

WORKDIR ~/app

COPY package.json ./

RUN npm i

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]