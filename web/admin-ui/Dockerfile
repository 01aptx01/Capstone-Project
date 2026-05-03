FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Browser must reach Flask from the host (same pattern as machine-ui)
ARG NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_ADMIN_API_URL=$NEXT_PUBLIC_ADMIN_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
