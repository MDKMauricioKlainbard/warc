#!/bin/sh

# Apagar
docker compose -f docker-compose-dev.yml down

# Levantar servicios nuevamente
docker compose -f docker-compose-dev.yml up --build -d

# Instalar dependencias y correr servidor
npm install
npm run start:dev
