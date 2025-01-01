
import { Request } from "express";

export interface CreateItemDto {
  title: string;
  price: number;
  userId: string;
  files: Request['files']
}

export interface UpdateItemDto {
  userId: string;
  title: string;
  price: number;
  itemId: string;
}

export interface DeleteItemDto {
  itemId: string;
  userId: string
}

export interface AddImagesDto {
  userId: string;
  itemId: string;
  files: Request['files']
}

export interface DeleteImagesDto {
  userId: string;
  itemId: string;
  imagesIds: Array<string>
}
