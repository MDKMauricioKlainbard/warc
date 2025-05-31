import { JsonRpcProvider, Wallet as EWallet, Contract, parseEther } from "ethers"
import { Logger } from "winston";
import warcAbi from "../abi/abi.json"

/**
 * Clase `Wallet` que representa la billetera del servidor.
 * 
 * Esta clase se encarga de inicializar y gestionar una billetera de Ethereum (u otra red EVM compatible),
 * utilizando una clave privada y un proveedor RPC especificados en las variables de entorno.
 */
class Wallet {
    /**
     * Instancia de la billetera (`ethers.Wallet`) inicializada con la clave privada y el proveedor RPC.
     */
    wallet: EWallet | null
    token: Contract | null

    constructor() {
        this.wallet = null
        this.token = null
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
    initializeWallet(logger: Logger): void {
        logger.debug("Iniciando billetera virtual del servidor...")

        const { RPC_URL, PRIVATE_KEY, TOKEN_ADDRESS } = process.env;

        if (!RPC_URL || !PRIVATE_KEY || !TOKEN_ADDRESS) {
            logger.error("Faltan variables de entorno: RPC_URL, PRIVATE_KEY o TOKEN_ADDRESS.");
            process.exit(1);
        }

        // Se crea un proveedor RPC y se instancia la billetera del servidor
        const provider = new JsonRpcProvider(RPC_URL)
        const wallet = new EWallet(PRIVATE_KEY, provider)
        this.wallet = wallet
        this.token = new Contract(TOKEN_ADDRESS, warcAbi, wallet);

        logger.debug("Billetera y contrato del token instanciados correctamente.");

        return
    }

    async transferWARC(to: string, amount: string) {
        if (!this.token) {
            throw new Error("El contrato del token no fue instanciado")
        }
        const tx = await this.token.transfer(to, parseEther(amount))
        return await tx.wait()
    }
}

/**
 * Instancia exportada de la billetera del servidor.
 * 
 * Se debe llamar al método `initializeWallet(logger)` antes de usarla.
 */
export const wallet = new Wallet()
