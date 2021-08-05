# -- BUILD STAGE --------------------------------
FROM node:16.6.1-slim AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /src

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src/

RUN yarn build

# -- RUNTIME STAGE --------------------------------
FROM node:16.6.1-slim
ENTRYPOINT [ "node" ]
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /src/dist /app

CMD [ "/app/index.js" ]
