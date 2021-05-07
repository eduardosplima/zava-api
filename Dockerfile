FROM node:alpine AS node-alpine-oracle

ARG ORACLE_INSTALL=/opt/oracle
ARG ORACLE_HOME=${ORACLE_INSTALL}/instantclient
ENV LD_LIBRARY_PATH=${ORACLE_HOME}

WORKDIR ${ORACLE_INSTALL}
RUN apk update
RUN apk add libaio libnsl libc6-compat
RUN wget -q https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linuxx64.zip
RUN unzip -q instantclient-basic-linuxx64.zip
RUN rm -rf instantclient-basic-linuxx64.zip
RUN mv $(ls) ${ORACLE_HOME}
RUN ln -s ${ORACLE_HOME}/*.so /usr/lib
RUN ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1
RUN ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2
RUN ln -s /lib64/ld-linux-x86-64.so.2 /usr/lib/ld-linux-x86-64.so.2
##################################################
FROM node-alpine-oracle AS build

ARG buildcmd="npm run build:prod"

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN ${buildcmd}
##################################################
FROM node-alpine-oracle AS package

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk add dumb-init

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=prod
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

USER node
CMD ["dumb-init", "node", "index"]