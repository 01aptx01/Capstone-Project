FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# รับค่าจาก docker-compose มาฝังตอน build (Next.js inlines NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_OMISE_PUBLIC_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AGENT_BASE_URL
ARG NEXT_PUBLIC_MACHINE_CODE=MP1-001
ENV NEXT_PUBLIC_OMISE_PUBLIC_KEY=$NEXT_PUBLIC_OMISE_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AGENT_BASE_URL=$NEXT_PUBLIC_AGENT_BASE_URL
ENV NEXT_PUBLIC_MACHINE_CODE=$NEXT_PUBLIC_MACHINE_CODE

RUN npm run build

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]