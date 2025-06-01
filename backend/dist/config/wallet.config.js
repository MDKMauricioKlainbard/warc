"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const ethers_1 = require("ethers");
const abi_json_1 = __importDefault(require("../abi/abi.json"));
const logger_loader_1 = require("../loaders/logger/logger.loader");
/**
 * Clase `Wallet` que representa la billetera del servidor.
 *
 * Esta clase se encarga de inicializar y gestionar una billetera de Ethereum (u otra red EVM compatible),
 * utilizando una clave privada y un proveedor RPC especificados en las variables de entorno.
 */
class Wallet {
    constructor() {
        this.wallet = null;
        this.token = null;
        this.distributionWallet = null;
        this.distributionToken = null;
        this.distributionAddress = null;
    }
    /**
     * Inicializa la billetera del servidor utilizando las variables de entorno `RPC_URL` y `PRIVATE_KEY`.
     *
     * @param logger Logger de Winston para registrar eventos y errores durante la inicialización.
     *
     * Este método:
     * - Valida la presencia de las variables de entorno requeridas.
     * - Crea un proveedor de red con `ethers.JsonRpcProvider`.
     * - Instancia la billetera con la clave privada y el proveedor.
     *
     * En caso de faltar alguna variable crítica, se registra un error y se detiene el proceso con `process.exit(1)`.
     */
    initializeWallet(logger) {
        logger.debug("Iniciando billeteras virtuales del servidor...");
        const { RPC_URL, PRIVATE_KEY, TOKEN_ADDRESS, PRIVATE_DISTRIBUTION_KEY, DISTRIBUTION_WALLET_ADDRESS } = process.env;
        if (!RPC_URL || !PRIVATE_KEY || !TOKEN_ADDRESS || !PRIVATE_DISTRIBUTION_KEY || !DISTRIBUTION_WALLET_ADDRESS) {
            logger.error("Faltan variables de entorno: RPC_URL, PRIVATE_KEY, PRIVATE_DISTRIBUTION_KEY, DISTRIBUTION_WALLET_ADDRESS o TOKEN_ADDRESS.");
            process.exit(1);
        }
        // Se crea un proveedor RPC y se instancia las billetera del servidor
        const provider = new ethers_1.JsonRpcProvider(RPC_URL);
        this.wallet = new ethers_1.Wallet(PRIVATE_KEY, provider);
        this.token = new ethers_1.Contract(TOKEN_ADDRESS, abi_json_1.default, this.wallet);
        this.distributionWallet = new ethers_1.Wallet(PRIVATE_DISTRIBUTION_KEY, provider);
        this.distributionToken = new ethers_1.Contract(TOKEN_ADDRESS, abi_json_1.default, this.distributionWallet);
        this.distributionAddress = DISTRIBUTION_WALLET_ADDRESS;
        logger.debug("Billeteras y contrato del token instanciados correctamente.");
        return;
    }
    /**
 * Realiza una transferencia del token WARC desde la billetera del servidor a otra dirección.
 *
 * @param to Dirección Ethereum del receptor.
 * @param amount Cantidad de tokens a transferir, expresada como string (en unidades enteras, no en wei).
 *
 * @returns La transacción confirmada (`ethers.TransactionReceipt`), una vez que ha sido minada.
 *
 * @throws {Error} Si el contrato del token no fue instanciado correctamente antes de llamar al método.
 *
 * Este método:
 * - Verifica que el contrato del token (`this.token`) haya sido inicializado correctamente.
 * - Verifica que la cantidad a transferir sea mayor a 0.
 * - Llama a la función `transfer` del contrato para enviar los tokens al destinatario.
 * - Convierte la cantidad de tokens a wei usando `parseEther`.
 * - Espera la confirmación de la transacción (`tx.wait()`).
 */
    async transferWARC(to, amount) {
        if (!this.token) {
            throw new Error("El contrato del token no fue instanciado");
        }
        if (Number(amount) <= 0) {
            throw new Error("La cantidad a transferir debe ser mayor a 0");
        }
        const tx = await this.token.transfer(to, (0, ethers_1.parseEther)(amount));
        return await tx.wait();
    }
    /**
 * Realiza una transferencia del token WARC desde una billetera externa hacia la billetera de distribución del servidor.
 *
 * @param from Dirección Ethereum del emisor (billetera del usuario).
 * @param amount Cantidad de tokens a transferir, expresada como number (en unidades enteras, no en wei).
 *
 * @returns La transacción confirmada (`ethers.TransactionReceipt`), una vez que ha sido minada.
 *
 * @throws {Error} Si:
 * - El contrato del token no fue instanciado correctamente.
 * - La cantidad a transferir es menor o igual a 0.
 * - La billetera del usuario no tiene suficientes tokens.
 * - La transacción `transferFrom` falla (por ejemplo, si no se ha aprobado previamente al servidor como `spender`).
 *
 * Este método:
 * - Verifica que el contrato del token (`this.token`) esté inicializado.
 * - Verifica que la cantidad de tokens sea válida y mayor a cero.
 * - Obtiene el balance de `from` para asegurar que tiene suficientes tokens.
 * - Llama a `transferFrom` para mover los tokens desde la billetera del usuario (`from`)
 *   hacia la billetera de distribución del servidor.
 * - Es necesario que el usuario haya aprobado previamente al servidor como `spender` mediante el método `approve`.
 */
    async transferWARCToDistributionPool(from, amount) {
        if (!this.token) {
            throw new Error("El contrato del token no fue instanciado");
        }
        if (Number(amount) <= 0) {
            throw new Error("La cantidad a transferir debe ser mayor a 0");
        }
        const balance = await this.token.balanceOf(from);
        const required = (0, ethers_1.parseEther)(amount.toString());
        if (balance < required) {
            throw new Error("La dirección emisora no tiene suficientes WARC.");
        }
        try {
            const tx = await this.token.transferFrom(from, this.distributionAddress, required);
            await tx.wait();
        }
        catch (error) {
            logger_loader_1.logger.error(`Error al transferir tokens desde la billetera del usuario al servidor: ${error.message}`);
            throw new Error("Error al transferir tokens desde la billetera del usuario al servidor. Asegúrese de haber aprobado previamente la transacción");
        }
    }
    /**
 * Transfiere tokens WARC desde la billetera de distribución a otra dirección.
 *
 * @param to Dirección del receptor.
 * @param amount Cantidad de tokens a transferir, expresada como número entero (no en wei).
 *
 * @returns Una promesa que resuelve una vez que la transacción ha sido confirmada (`tx.wait()`).
 *
 * @throws {Error} Si el contrato de distribución no fue instanciado correctamente.
 * @throws {Error} Si la cantidad a transferir es menor o igual a cero.
 * @throws {Error} Si la billetera de distribución no posee suficientes tokens.
 * @throws {Error} Si ocurre un error durante la transferencia (por ejemplo, falta de aprobación o gas).
 *
 * Este método:
 * - Verifica que el contrato del token para distribución (`this.distributionToken`) esté instanciado.
 * - Comprueba que la cantidad a transferir sea válida (mayor a 0).
 * - Verifica que la billetera de distribución tenga saldo suficiente.
 * - Llama a la función `transfer` del contrato para mover los tokens a la dirección destino.
 * - Espera la confirmación de la transacción antes de finalizar.
 */
    async transferWARCFromDistributionPool(to, amount) {
        if (!this.distributionToken) {
            throw new Error("El contrato de distribución del token no fue instanciado");
        }
        if (Number(amount) <= 0) {
            throw new Error("La cantidad a transferir debe ser mayor a 0");
        }
        const balance = await this.distributionToken.balanceOf(this.distributionAddress);
        const required = (0, ethers_1.parseEther)(amount.toString());
        if (balance < required) {
            throw new Error("La billetera de distribución no tiene suficientes WARC.");
        }
        try {
            const tx = await this.distributionToken.transfer(to, required);
            await tx.wait();
        }
        catch (error) {
            logger_loader_1.logger.error(`Error al transferir tokens desde la billetera del usuario al servidor: ${error.message}`);
            throw new Error("Error al transferir tokens desde la billetera del usuario al servidor. Asegúrese de haber aprobado previamente la transacción");
        }
    }
}
/**
 * Instancia exportada de la billetera del servidor.
 *
 * Se debe llamar al método `initializeWallet(logger)` antes de usarla.
 */
exports.wallet = new Wallet();
