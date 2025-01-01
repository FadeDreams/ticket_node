
export interface AddItemToCartDto {
  userId: string;
  quantity: number,
  itemId: string
}

export interface CreateCartItemDto {
  cartId: string;
  quantity: number;
  itemId: string
}

export interface RemoveItemFromCartDto {
  cartId: string;
  itemId: string
}

export interface UpdateCartItemQuantityDto {
  cartId: string,
  itemId: string,
  options: { inc: boolean, amount: number }
}
