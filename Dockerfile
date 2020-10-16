FROM node:8

COPY . . 

RUN npm install --production

CMD ["npm", "start"]
