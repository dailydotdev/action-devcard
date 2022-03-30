# -- BUILD STAGE --------------------------------
FROM node:16.14.2-slim AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /src

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src/

RUN yarn build

# -- RUNTIME STAGE --------------------------------
FROM node:16.14.2-slim
ENTRYPOINT [ "node" ]
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
		git \
		fonts-roboto \
	\
	&& rm -rf /var/lib/apt/lists/*


COPY --from=build /src/dist /app

CMD [ "/app/index.js" ]
