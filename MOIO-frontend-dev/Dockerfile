FROM node:20.17.0-alpine AS build
ADD . /app

WORKDIR /app

RUN npm i

RUN npm run build

FROM node:20.17.0-alpine

COPY --from=build /app/.output /webapp/.output

EXPOSE 3000

WORKDIR /webapp/.output

ENTRYPOINT ["node", "/webapp/.output/server/index.mjs"]
