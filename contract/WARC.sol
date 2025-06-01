// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title WARC Token - ERC20 personalizado con funcionalidad de distribución
/// @notice Este contrato representa un token ERC20 llamado WARC con una función adicional para transferir tokens a un pool de distribución.
/// @dev Hereda de OpenZeppelin ERC20. Usa 18 decimales por defecto.
contract WARC is ERC20 {
    /// @notice Dirección del pool de distribución de tokens
    address public distributionPool;

    /// @notice Constructor que inicializa el token WARC
    /// @param initialSupply Cantidad inicial de tokens (sin considerar los decimales)
    /// @param _distributionPool Dirección a la cual se enviarán tokens para distribución
    constructor(uint256 initialSupply, address _distributionPool) ERC20("WARC", "WARC") {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
        distributionPool = _distributionPool;
    }

    /// @notice Transfiere tokens al pool de distribución desde el emisor
    /// @dev Verifica que el remitente tenga suficiente saldo antes de transferir
    /// @param quantity Cantidad de tokens a transferir (en la unidad mínima del token, ej: wei si fuesen ETH)
    function transferToDistributionPool(uint256 quantity) public {
        require(balanceOf(msg.sender) >= quantity, "Saldo insuficiente para la transferencia");
        _transfer(msg.sender, distributionPool, quantity);
    }
}
