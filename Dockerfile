FROM node:alpine
MAINTAINER Ehsan Asdar <easdar@gatech.edu>

RUN mkdir -p /usr/src/pipes
WORKDIR /usr/src/pipes

# Bundle app source
COPY . /usr/src/pipes
RUN npm install
RUN npm install -g typescript
RUN tsc
EXPOSE 6789
CMD ["npm", "start"]
