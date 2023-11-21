
import mongoose from 'mongoose'
import { CartItemDoc, CartItemModel } from '@fadedreams7pcplatform/common';

const schema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  quantity: { type: Number, required: true }

})

export const CartItem = mongoose.model<CartItemDoc, CartItemModel>('CartItem', schema)
