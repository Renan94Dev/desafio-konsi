FROM node:18-alpine

WORKDIR /home/node/app

EXPOSE 3000

CMD [ "tail", "-f", "/dev/null" ]