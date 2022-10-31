import { v4 as uuid } from 'uuid';
import {
  ILogger, IWalletService, IOrderRepository, IProductRepository,
} from '../common/interfaces';
import Order, { OrderStatus } from '../domain/order';

type CreateOrderInput = {
  productId: string;
  quantity: number;
  buyerAddress: string;
  buyerTransaction: string;
  atomicSwapSalt: number;
};

type Context = {
  logger: ILogger;
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  walletService: IWalletService;
};

const ORDER_FEE = 48000; // 0.1 ETH - Fee merchant would like to pay for the sell tx.

export default async function createOrderUseCase(orderInput: CreateOrderInput, context: Context) : Promise<Order> {
  const product = await context.productRepository.getById(orderInput.productId);

  // Create domain object
  const order = new Order({
    id: uuid(),
    ...orderInput,
    product,
    amount: orderInput.quantity * product.price,
    fee: ORDER_FEE,
    status: OrderStatus.Pending,
  });

  // Ensure the token/quantity is available in the wallet
  await context.walletService.ensureProductAvailability(product, orderInput.quantity);

  // Update order status if the transaction is confirmed on chain
  async function onConfirmTransaction() {
    context.logger.info(`Updating order status to Completed for order ${order.id}`);
    order.setStatus(OrderStatus.Completed);
    await context.orderRepository.updateOrder(order);
  }

  // Create swap transaction and broadcast to blockchain
  const sellerTransaction = await context.walletService.executeOrder(order, { atomicSwapSalt: orderInput.atomicSwapSalt }, onConfirmTransaction);
  order.sellerTransaction = sellerTransaction;

  // Persist in DB
  await context.orderRepository.createOrder(order);

  return order;
}
