// src/consumer/interfaces/consumer.interface.ts
import { AddItemToCartDto, UpdateCartItemQuantityDto, RemoveItemFromCartDto } from '../dtos/cart.dto';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/common';
import Stripe from 'stripe';

export interface IConsumerService {
    addItemToCart(addItemToCart: AddItemToCartDto): Promise<any>;
    updateCartItemQuantity(updateCartItemQuantity: UpdateCartItemQuantityDto): Promise<any>;
    removeItemFromCart(removeItemFromCart: RemoveItemFromCartDto): Promise<any>;
    getCart(cartId: string, userId: string): Promise<any>;
    checkout(userId: string, cardToken: string, userEmail: string): Promise<any>;
    updateCustomerStripeCard(userId: string, newCardToken: string): Promise<any>;
}
