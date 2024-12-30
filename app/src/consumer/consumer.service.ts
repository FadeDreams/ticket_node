// app/src/consumer/consumer.service.ts
import { CartService, cartService } from './cart/cart.service';
import { ItemService, itemService } from '../provider/item/item.service';
import { AddItemToCartDto, UpdateCartItemQuantityDto, RemoveItemFromCartDto } from './dtos/cart.dto';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/common';
import { OrderService, orderService } from './order/order.service';
import Stripe from 'stripe';
import RedisConnection from '../infrastructure/persistence/RedisConnection'; // Import RedisConnection
import logger from '../infrastructure/logging/Logger'; // Import the logger

// Create a single instance of RedisConnection
const redisConnection = new RedisConnection();

export class ConsumerService {
    constructor(
        public cartService: CartService,
        public itemService: ItemService,
        public orderService: OrderService,
        public stripeService: Stripe
    ) { }

    async addItemToCart(addItemToCart: AddItemToCartDto) {
        const item = await this.itemService.getOneById(addItemToCart.itemId);
        if (!item) return new BadRequestError('item not found!');

        const cart = await this.cartService.addItem(addItemToCart, item);
        if (!cart) return new Error('could not update the cart');
        return cart;
    }

    async updateCartItemQuantity(updateCartItemQuantity: UpdateCartItemQuantityDto) {
        const { itemId, cartId } = updateCartItemQuantity;
        const cartItem = await this.cartService.getCartItemById(itemId, cartId);
        if (!cartItem) return new BadRequestError('item not found in cart');

        const cart = await this.cartService.updateItemQuantity(updateCartItemQuantity);
        if (!cart) return new Error('could not update the cart');
        return cart;
    }

    async removeItemFromCart(removeItemFromCart: RemoveItemFromCartDto) {
        const { itemId, cartId } = removeItemFromCart;
        const cartItem = await this.cartService.getCartItemById(itemId, cartId);
        if (!cartItem) return new BadRequestError('item not found in cart');

        const cart = await this.cartService.removeItemFromCart(removeItemFromCart);
        if (!cart) return new Error('could not update the cart');
        return cart;
    }

    async getCart(cartId: string, userId: string) {
        const client = redisConnection.getClient();
        if (!client) {
            logger.error('Redis client is not connected.');
            throw new Error('Redis client is not connected.');
        }

        // First, try to get the cart from Redis
        const cartStr = await client.get(cartId);
        if (cartStr) {
            // If the cart is in Redis, return it
            return JSON.parse(cartStr);
        }

        // If the cart is not in Redis, get it from your database
        const cart = await this.cartService.getCart(cartId);
        if (!cart) return new BadRequestError('cart not found');
        if (cart.user.toString() !== userId) return new NotAuthorizedError();

        // Save the cart in Redis
        await client.set(cartId, JSON.stringify(cart));

        return cart;
    }

    async checkout(userId: string, cardToken: string, userEmail: string) {
        const cart = await this.cartService.findOneByUserId(userId);
        if (!cart) return new BadRequestError('your cart is empty!');
        if (cart.items.length === 0) return new BadRequestError('your cart is empty!');

        let customer_id: string;

        if (cart.customer_id) {
            customer_id = cart.customer_id;
        } else {
            const { id } = await this.stripeService.customers.create({
                email: userEmail,
                source: cardToken
            });
            customer_id = id;
            await cart.set({ customer_id }).save();
        }

        if (!customer_id) return new BadRequestError('Invalid data');

        const charge = await this.stripeService.charges.create({
            amount: cart.totalPrice * 100,
            currency: 'usd',
            customer: customer_id
        });

        if (!charge) return new BadRequestError('Invalid data! could not create the charge!');

        // Create new order
        await this.orderService.createOrder({
            userId,
            totalAmount: cart.totalPrice,
            chargeId: charge.id
        });

        // Clear cart
        await this.cartService.clearCart(userId, cart._id);

        return charge;
    }

    async updateCustomerStripeCard(userId: string, newCardToken: string) {
        const cart = await this.cartService.findOneByUserId(userId);
        if (!cart) return new BadRequestError('your cart is empty!');
        if (!cart.customer_id) return new BadRequestError('you\'re not a customer!');

        try {
            await this.stripeService.customers.update(cart.customer_id, {
                source: newCardToken
            });
        } catch (err) {
            logger.error('Card update failed:', err);
            return new Error('card update failed!');
        }
        return true;
    }
}

// Create an instance of ConsumerService
export const consumerService = new ConsumerService(
    cartService,
    itemService,
    orderService,
    new Stripe(process.env.STRIPE_KEY!, { apiVersion: '2023-10-16' })
);
