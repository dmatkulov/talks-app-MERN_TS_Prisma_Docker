# Используем образ Линукс Альпайн
FROM node:24.10-alpine

# Указываем раб директорию
WORKDIR /app

# Скопировать package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

## Prisma
#RUN npm install -g prisma

# Копируем prisma schema
COPY prisma/schema.prisma ./prisma/

# Генерируем Prisma Client через локальную версию
RUN npx prisma generate

# Открыть порт в нашем контейнере
EXPOSE 3000

# Запускаем наш сервер
CMD ["npm", "start"]