FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Browser must reach Flask from the host (same pattern as machine-ui / admin-ui)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_MACHINE_CODE=MP1-001
ARG NEXT_PUBLIC_FULFILLMENT_MODE=immediate
ARG NEXT_PUBLIC_OMISE_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MACHINE_CODE=$NEXT_PUBLIC_MACHINE_CODE
ENV NEXT_PUBLIC_FULFILLMENT_MODE=$NEXT_PUBLIC_FULFILLMENT_MODE
ENV NEXT_PUBLIC_OMISE_PUBLIC_KEY=$NEXT_PUBLIC_OMISE_PUBLIC_KEY

RUN npm run build

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
