import { CreateItemDto, UpdateItemDto, DeleteItemDto, AddImagesDto, DeleteImagesDto } from '../dtos/item.dto';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/common';

export interface IProviderService {
    addItem(createItem: CreateItemDto): Promise<any>;
    updateItem(updateItem: UpdateItemDto): Promise<any>;
    deleteItem(deleteItem: DeleteItemDto): Promise<any>;
    addItemImages(addImagesDto: AddImagesDto): Promise<any>;
    deleteItemImages(deleteImages: DeleteImagesDto): Promise<any>;
}
