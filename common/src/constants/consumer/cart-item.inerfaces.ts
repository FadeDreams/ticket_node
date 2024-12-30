import mongoose from 'mongoose'
import { CartDoc } from './cart.interfaces'
import { ItemDoc } from '../provider/item.interfaces'

export interface CartItemDoc extends mongoose.Document {
  cart: CartDoc | string;
  item: ItemDoc;
  quantity: number
}

export interface CartItemModel extends mongoose.Model<CartItemDoc> { }
