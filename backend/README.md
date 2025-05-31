# Backend del Proyecto

Este repositorio contiene el backend de la aplicación desarrollado durante el torneo. Se basa en Express.js y utiliza Docker para facilitar el entorno de desarrollo.

## ⚙️ Comportamiento básico

El backend está construido con Node.js y el framework Express. En este contexto, se expone una API REST que puede interactuar con bases de datos, autenticar usuarios, servir contenido y cualquier otra lógica necesaria para el funcionamiento general del sistema.

### 🔁 Modo de desarrollo (live watch)

Para facilitar el trabajo en tiempo real, el entorno de desarrollo **no genera una imagen de Docker para la app Express directamente**. En su lugar:

- Se utiliza un `docker-compose-dev.yml` que levanta únicamente los servicios necesarios (como bases de datos, redes, etc.).
- Express se ejecuta directamente desde el host local usando `tsx watch`, lo que permite **detectar automáticamente los cambios en el código** y reiniciar el servidor sin necesidad de reconstruir contenedores.

### 🐳 docker-compose-dev

El archivo `docker-compose-dev.yml` define los contenedores de apoyo (por ejemplo, bases de datos, redes internas u otros servicios). Una de las imágenes está pensada para contener las **dependencias compartidas necesarias**, pero **no incluye directamente el código de Express**, lo que permite editar y probar el backend directamente desde el entorno local.

Esto brinda una experiencia de desarrollo más ágil y directa, ideal para el ritmo de un torneo o hackathon.

## ▶️ Inicialización automática

Para facilitar la puesta en marcha del entorno de desarrollo, se incluye un script bash llamado `run_dev.sh`.

### Ejecutarlo desde la raíz del proyecto:

```bash
./run_dev.sh
```

Este script automatiza la inicialización de los servicios definidos en docker-compose-dev.yml, así como cualquier otro paso necesario para comenzar a trabajar inmediatamente con el backend.

### 📝 Notas sobre documentación

Dado que este proyecto fue desarrollado en el contexto de un torneo de programación, toda la documentación, nombres de archivos, variables y comentarios se han redactado en español para una lectura rápida y comprensión inmediata entre los miembros del equipo.

### ✅ Requisitos

- Docker & Docker Compose
- Bash (opcional, puedes ejecutar manualmente la secuencia de comandos que aparece en el archivo run_dev.sh)
- Node.js instalado localmente (opcional si quieres correr Express sin Docker)