import mongoose from 'mongoose'
import { UserDoc } from '../auth/user.interfaces'
import { CartItemDoc } from './cart-item.inerfaces'

export interface CartDoc extends mongoose.Document {
    user: UserDoc | string;
    items: Array<CartItemDoc | string>;
    totalPrice: number;
    customer_id?: string
}

export interface CartModel extends mongoose.Model<CartDoc> {}