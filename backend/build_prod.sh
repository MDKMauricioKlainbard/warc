# 1. Bajar los servicios
docker compose -f docker-compose-prod.yml down

# 2. Hacer build sin caché (este es el paso importante)
docker compose -f docker-compose-prod.yml build --no-cache

# 3. Levantar los servicios
docker-compose -p warcprender -f docker-compose-prod.yml --env-file .prod.env up -d