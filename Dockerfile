FROM node:7
WORKDIR /server
COPY package.json /server
RUN npm install
COPY . /server
CMD node server.js
#From the docker container we expose port 80
EXPOSE 80