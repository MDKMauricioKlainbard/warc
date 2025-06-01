# WalkARCoin Frontend (Beta)

![WARC Logo](https://github.com/MDKMauricioKlainbard/warc/blob/main/frontend/assets/logo-warc.png)

> 🧪 **Versión beta del frontend móvil de WalkARCoin (WARC)**  
> 💡 La funcionalidad de Realidad Aumentada (AR) será incluida en futuras versiones.  
> 🧑‍💻 Este proyecto está construido con **React Native** y tecnologías modernas para mapas, navegación, animaciones y geolocalización.

---

## 📱 ¿Qué es WalkARCoin?

**WalkARCoin (WARC)** es una plataforma Web3 que recompensa a los usuarios con tokens por caminar, explorar su entorno y recolectar NFTs en coordenadas reales. Esta app móvil permite a los usuarios visualizar tokens y NFTs geolocalizados a través de un mapa interactivo. En esta versión beta, nos enfocamos en:

- Mapa con tokens distribuidos geográficamente.
- Sistema de navegación.
- Recolección de tokens solo si el usuario está cerca (verificado por GPS).
- Soporte inicial para NFTs geolocalizados (sin visualización AR aún).

---

## 🚀 Tecnologías Utilizadas

- **React Native v0.79.2**
- **React v19**
- **@rnmapbox/maps** para mapas y geolocalización avanzada.
- **React Navigation** para navegación por pantallas.
- **Async Storage** para persistencia local.
- **Axios** para llamadas HTTP.
- **TypeScript** para tipado estricto.
- **Patch Package** para ajustes temporales de dependencias.

---

## 📦 Scripts disponibles

| Script         | Comando                         | Descripción                                  |
|----------------|----------------------------------|----------------------------------------------|
| Iniciar App    | `npm run start`                  | Inicia el metro bundler                      |
| Android        | `npm run android`                | Lanza la app en un dispositivo/emulador Android |
| iOS            | `npm run ios`                    | Lanza la app en un simulador iOS (macOS)     |
| Linter         | `npm run lint`                   | Ejecuta ESLint sobre el proyecto             |
| Tests          | `npm run test`                   | Ejecuta pruebas con Jest                     |
| Postinstall    | `patch-package`                  | Aplica parches de dependencias si existen    |

---

## 🔧 Requisitos

- **Node.js** >= 18.x
- **React Native CLI**
- **Xcode** (macOS, para iOS) o Android Studio
- **Configuración de Mapbox con token de acceso**

---

## 📌 Estado Actual

- ✅ Geolocalización funcional.
- ✅ Recolección de tokens mediante coordenadas.
- ✅ Navegación e interfaces básicas.
- 🕒 Realidad Aumentada (AR): *no disponible en esta versión beta*.

---

## 🧪 En desarrollo

En futuras versiones:

- 🔜 Visualización de NFTs con Realidad Aumentada (ARKit / ARCore).
- 🔜 Creación de NFTs desde la app móvil.
- 🔜 Sistema de cacería de tesoros colaborativa.
- 🔜 Marketplace de NFTs con zonas VIP.

---

## 📷 Icono del proyecto

![Logo](https://github.com/MDKMauricioKlainbard/warc/blob/main/frontend/assets/logo-warc.png)

---

## 🤝 Contribuciones

Este es un proyecto en fase **beta cerrada**, por lo que aún no se aceptan pull requests externos. Si estás interesado en colaborar, escríbenos.

---

## 📄 Licencia

MIT License © 2025 - WalkARCoin Dev Team

