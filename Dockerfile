FROM node:alpine
MAINTAINER Anthony Liu <ajliu@gatech.edu>

RUN mkdir -p /usr/src/pipes
WORKDIR /usr/src/pipes

# Bundle app source
COPY . /usr/src/pipes
RUN npm install
EXPOSE 3000
CMD ["npm", "run prod"]
