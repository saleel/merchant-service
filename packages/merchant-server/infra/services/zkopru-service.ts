/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved  */

// Note: Use `yarn link` to resolve below modules
import axios from 'axios';
import Zkopru from '@zkopru/client';
import {
  ZkAccount, ZkopruNode, ZkopruWallet,
} from '@zkopru/client/dist/node';
import { ZkTx } from '@zkopru/transaction';
import BN from 'bn.js';
import { fromWei, toWei } from 'web3-utils';
import {
  ILogger, TokenStandard, IWalletService,
} from '../../common/interfaces';
import Order from '../../domain/order';
import Product from '../../domain/product';
import { ValidationError } from '../../common/error';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

type L2ServiceConstructor = {
  websocketUrl: string;
  contractAddress: string;
  accountPrivateKey: string;
}

export default class ZkopruService implements IWalletService {
  logger: ILogger;

  // URL for ETH node RPC (websocket)
  websocketUrl: string;

  // Zkopru contract address on L1
  contractAddress: string;

  private accountPrivateKey: string;

  zkAccount: ZkAccount;

  node: ZkopruNode;

  wallet: ZkopruWallet;

  // Local state for storing token balances on L2
  balances: Record<TokenStandard, Record<string, object | object[]>>;

  // Interval to refresh L2 balance in ms
  balanceUpdateInterval : number;

  private timer: NodeJS.Timeout;

  constructor(params: L2ServiceConstructor, context: { logger: ILogger }) {
    this.logger = context.logger;

    this.accountPrivateKey = params.accountPrivateKey;
    this.zkAccount = new ZkAccount(params.accountPrivateKey);

    this.node = Zkopru.Node({
      websocket: params.websocketUrl,
      address: params.contractAddress,
      accounts: [this.zkAccount],
      databaseName: 'zkopru.db',
    });

    this.balances = {
      [TokenStandard.Erc20]: {},
      [TokenStandard.Erc721]: {},
    };

    this.balanceUpdateInterval = 10 * 1000;
  }

  async start() {
    await this.node.initNode();

    this.wallet = new Zkopru.Wallet(this.node, this.accountPrivateKey);

    await this.node.start();

    this.logger.info({
      ethAddress: this.wallet.wallet.account.ethAddress,
      l2Address: this.wallet.wallet.account.zkAddress.toString(),
    }, 'Started Zkopru Node');

    await this.updateBalance();
  }

  stop() {
    clearTimeout(this.timer);
  }

  async updateBalance() {
    this.logger.debug('Updating wallet balances');
    const spendable = await this.wallet.wallet.getSpendableAmount();

    this.balances = {
      [TokenStandard.Erc721]: spendable.erc721,
      [TokenStandard.Erc20]: spendable.erc20,
    };
    this.logger.debug(this.balances, 'Wallet balance');

    this.timer = setTimeout(async () => {
      await this.updateBalance();
    }, this.balanceUpdateInterval);
  }

  async ensureProductAvailability(product: Product, quantity: number) {
    if (product.tokenStandard === TokenStandard.Erc20) {
      const available = this.balances[product.tokenStandard][product.contractAddress] as BN;
      const requiredQuantity = new BN(toWei(quantity.toString(), 'ether'));

      if (!available || requiredQuantity.gt(available)) {
        throw new ValidationError(
          `No enough balance in wallet for token ${product.contractAddress} for required quantity ${quantity}. Only ${fromWei((available || 0).toString(), 'ether')} available.`,
        );
      }
    } else if (product.tokenStandard === TokenStandard.Erc721) {
      const availableTokens = this.balances[product.tokenStandard][product.contractAddress] as BN[] || [];
      const isAvailable = (availableTokens as BN[] || []).some((el) => el.eq(new BN(product.tokenId)));
      if (!isAvailable) {
        throw new ValidationError(`Token ${product.tokenId} in contract ${product.contractAddress} not present in wallet.`);
      }
    } else {
      throw new ValidationError('Unknown Token Standard');
    }
  }

  async executeOrder(order: Order, params: { atomicSwapSalt: string }) {
    // Generate swap transaction (sell tx)
    const merchantTx = await this.wallet.generateSwapTransaction(
      order.buyerAddress,
      order.product.contractAddress,
      toWei(new BN(order.quantity)).toString(),
      ZERO_ADDRESS,
      toWei(new BN(order.amount)).toString(),
      (+order.fee * (10 ** 9)).toString(), // TODO: Verify fee / weiPerByte calculation
      params.atomicSwapSalt,
    );

    try {
      // Create shielded transaction and encode it
      const merchantZkTx = await this.wallet.wallet.shieldTx({ tx: merchantTx });
      const merchantTxEncoded = merchantZkTx.encode().toString('hex');

      const buyerZkTx = ZkTx.decode(Buffer.from(order.buyerTransaction, 'hex'));

      this.logger.debug({ buyerZkTx, merchantTx }, 'Swap transactions');

      if (!merchantZkTx.outflow.some((o) => o.note.eq(buyerZkTx.swap))) {
        throw new Error('Customer desired swap not found in generated merchant tx outflow.');
      }

      if (!buyerZkTx.outflow.some((o) => o.note.eq(merchantZkTx.swap))) {
        throw new ValidationError('Desired swap not found in any the transaction outflow.');
      }

      // Send both transactions to the coordinator
      const coordinatorUrl = await this.wallet.wallet.coordinatorManager.activeCoordinatorUrl();
      const response = await axios(`${coordinatorUrl}/txs`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        data: JSON.stringify([merchantTxEncoded, order.buyerTransaction]),
      });

      // Revert UTXO status if tx fails
      if (response.status !== 200) {
        throw Error(`Error while sending tx to coordinator ${JSON.stringify(response.data)}`);
      }

      return merchantTxEncoded;
    } catch (error) {
      await this.wallet.wallet.unlockUtxos(merchantTx.inflow);
      throw error;
    }
  }

  async filterConfirmedOrders(orders: Order[]) : Promise<Order[]> {
    const { history } = await this.wallet.transactionsFor(this.wallet.wallet.account.zkAddress.toString(), this.wallet.wallet.account.ethAddress);

    const receivedTransactions = history.filter((t) => t.type === 'Receive');

    const confirmedOrders = orders.filter((order) => {
      // Decode buyer transaction and calculate hash
      const buyerZkTx = ZkTx.decode(Buffer.from(order.buyerTransaction, 'hex'));
      const hash = buyerZkTx.hash().toString();

      return receivedTransactions.some((t) => t.hash === hash);
    });

    return confirmedOrders;
  }
}
