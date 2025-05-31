#!/bin/sh

# Apagar y eliminar los volúmenes
docker compose -f docker-compose-dev.yml down -v

# Levantar servicios nuevamente
docker compose -f docker-compose-dev.yml up --build -d

# Instalar dependencias y correr servidor
npm install
npm run start:dev
