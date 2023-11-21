import { ItemService, itemService } from "./item/item.service";
import { CreateItemDto, UpdateItemDto, DeleteItemDto, AddImagesDto, DeleteImagesDto } from './dtos/item.dto'
import { BadRequestError, NotAuthorizedError, } from '@fadedreams7pcplatform/common'

export class ProviderService {
  constructor(
    public itemService: ItemService
  ) { }

  async addItem(createItem: CreateItemDto) {
    return await this.itemService.create(createItem)
  }

  async updateItem(updateItem: UpdateItemDto) {
    const item = await this.itemService.getOneById(updateItem.itemId);
    if (!item) return new BadRequestError('item not found!')
    if (item.user.toString() !== updateItem.userId) {
      return new NotAuthorizedError()
    }
    return await this.itemService.updateItem(updateItem);
  }

  async deleteItem(deleteItem: DeleteItemDto) {
    const item = await this.itemService.getOneById(deleteItem.itemId);
    if (!item) return new BadRequestError('item not found!');
    if (item.user.toString() !== deleteItem.userId) {
      return new NotAuthorizedError()
    }

    return await this.itemService.deleteItem(deleteItem)
  }

  async addItemImages(addImagesDto: AddImagesDto) {
    const item = await this.itemService.getOneById(addImagesDto.itemId);
    if (!item) return new BadRequestError('item not found!');
    if (item.user.toString() !== addImagesDto.userId) {
      return new NotAuthorizedError()
    }

    return await this.itemService.addImages(addImagesDto)
  }

  async deleteItemImages(deleteImages: DeleteImagesDto) {
    const item = await this.itemService.getOneById(deleteImages.itemId);
    if (!item) return new BadRequestError('item not found!');
    if (item.user.toString() !== deleteImages.userId) {
      return new NotAuthorizedError()
    }

    return await this.itemService.deleteImages(deleteImages)
  }
}
export const providerService = new ProviderService(itemService)
