# WARC Token – Smart Contract

Este repositorio contiene el código fuente y recursos asociados al Smart Contract del token **WARC**, el cual se basa en el estándar **ERC-20**.

## 📄 Descripción

El contrato implementa un token fungible bajo las especificaciones del estándar [ERC-20](https://eips.ethereum.org/EIPS/eip-20), compatible con billeteras y herramientas del ecosistema Ethereum.

Aunque el código del contrato se almacena y versiona en este repositorio, **el despliegue del contrato se realiza manualmente a través de la plataforma [Remix IDE](https://remix.ethereum.org/)**, lo que permite un control preciso durante las etapas de testing y producción.

---

## 📁 Estructura del repositorio

- `WARC.sol`: Código fuente del contrato inteligente.
- `abi.json`: ABI (Application Binary Interface) generado tras la compilación del contrato. Se utiliza para interactuar con el contrato desde aplicaciones externas.
- `contract-address.txt`: Archivo que contiene la dirección del contrato desplegado en la red correspondiente.

---

## 🚀 Despliegue

> ⚠️ El contrato **no se despliega automáticamente desde este repositorio**.

El despliegue se realiza utilizando **Remix**, conectando la billetera correspondiente (por ejemplo, MetaMask) y utilizando la red deseada (testnet o mainnet).

Pasos generales:
1. Abrir `WARC.sol` en Remix.
2. Compilar el contrato desde la pestaña de compilación.
3. Seleccionar el entorno de despliegue (Injected Web3).
4. Confirmar el despliegue con la billetera.
5. Guardar la dirección del contrato desplegado en `contract-address.txt`.

---

## 🔗 Uso del ABI

El archivo `abi.json` permite interactuar programáticamente con el contrato desde aplicaciones externas, por ejemplo, usando **Ethers.js** o **Web3.js**:

```ts
import { Contract } from "ethers"
import abi from "./abi.json"

const token = new Contract(CONTRACT_ADDRESS, abi, signer)
```

## 🛠 Requisitos para desarrollo

- Solidity ^0.8.x
- Remix IDE o cualquier entorno compatible con compilación y despliegue de contratos Solidity.
- Acceso a una billetera (como MetaMask) con fondos en la red deseada.

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver LICENSE para más detalles.