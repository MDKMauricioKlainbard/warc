# Backend de WalkARCoin (WARC)

![WARC Logo](https://github.com/MDKMauricioKlainbard/warc/blob/main/frontend/assets/logo-warc.png)

Este repositorio contiene el backend de WalkARCoin, una plataforma innovadora que combina blockchain, Realidad Aumentada (AR) y gamificación para incentivar el movimiento físico y la exploración del mundo real.

## 🎯 Visión del Proyecto

WalkARCoin es un proyecto basado en la red Polkadot que tiene como objetivo principal incentivar el movimiento físico, la exploración del mundo real y la interacción social a través de la blockchain, NFTs y la Realidad Aumentada (AR).

## ⚙️ Tecnologías Principales

- **Backend**: Node.js con Express.js
- **Base de Datos**: MongoDB (para almacenamiento de datos de usuarios y tokens futuramente para NFTs)
- **Blockchain**: Integración con Polkadot/Moonbeam
- **Geolocalización**: Servicios de mapeo y verificación GPS

## 🚀 Características Principales

- API REST para gestión de usuarios
- Integración con blockchain para transacciones WARC
- Sistema de geolocalización para tokens
- Autenticación y autorización de usuarios
- Sistema de recompensas por movimiento

## 🔧 Configuración del Entorno de Desarrollo

### Requisitos Previos

- Docker & Docker Compose
- Node.js (v16 o superior)
- npm o yarn
- Bash (opcional)

### Inicialización

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```
3. Configurar variables de entorno (crear archivo .env basado en .env.example)
4. Ejecutar el entorno de desarrollo:
```bash
./run_dev.sh
```

## 📦 Estructura del Proyecto

```
backend/
├── server/           # Código fuente principal
│   ├── abi/         # Archivos ABI para contratos inteligentes
│   ├── config/      # Configuraciones del servidor
│   ├── docs/        # Documentación técnica swagger
│   ├── loaders/     # Cargadores de módulos y servicios
│   ├── logs/        # Archivos de registro
│   ├── modules/     # Módulos de la aplicación
│   └── index.tsx    # Punto de entrada de la aplicación
├── package.json     # Dependencias y scripts
├── tsconfig.json    # Configuración de TypeScript
└── docker-compose-dev.yml # Configuración de Docker para desarrollo
```

## 🔄 Integración con Frontend

El backend está diseñado para trabajar en conjunto con el frontend de WalkARCoin, proporcionando:

- API REST para la gestión de usuarios
- Sistema de autenticación
- Gestión de geolocalización

## 🐳 Docker Development

El proyecto utiliza Docker para el entorno de desarrollo:

- `docker-compose-dev.yml`: Configuración para desarrollo
- Hot-reloading activado para desarrollo en tiempo real
- Servicios de base de datos y otros recursos en contenedores

## 📝 Documentación API

La documentación completa de la API está disponible en `/docs/api` cuando el servidor está en ejecución.

## 🔐 Seguridad

- Autenticación JWT
- Validación de datos
- Protección contra ataques comunes
- Verificación de geolocalización

## 🤝 Contribuciones

Este es un proyecto en fase **beta cerrada**, por lo que aún no se aceptan pull requests externos. Si estás interesado en colaborar, escríbenos.

---

## 📄 Licencia

MIT License © 2025 - WalkARCoin Dev Team