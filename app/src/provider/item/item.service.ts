
import { ItemModel, uploadDir } from "@fadedreams7pcplatform/common";
import { Item } from "./item.model";
import { CreateItemDto, UpdateItemDto, DeleteItemDto, AddImagesDto, DeleteImagesDto } from '../dtos/item.dto'

export class ItemService {
  constructor(public itemModel: ItemModel) { }

  async getOneById(itemId: string) {
    return await this.itemModel.findById(itemId)
  }

  async create(createItemDto: CreateItemDto) {
    const item = new this.itemModel({
      title: createItemDto.title,
      price: createItemDto.price,
      user: createItemDto.userId,
      images: [{ src: '' }]
    })

    return await item.save()
  }



}
