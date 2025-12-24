# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Vite envs are baked at build time; provide a default for container builds.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 의존성 캐시를 위해 먼저 복사
COPY package*.json ./
# yarn을 쓰면: COPY yarn.lock ./
RUN npm ci

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine
# Vite 빌드 결과물을 nginx 정적 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# SPA 라우팅(React Router) 대응을 위한 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker 빌드 
# docker build -t khw-frontend:latest .