
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface Folder {
    id: number;
    foldername?: Nullable<string>;
    type?: Nullable<string>;
}

export interface IQuery {
    folders(): Nullable<Nullable<Folder>[]> | Promise<Nullable<Nullable<Folder>[]>>;
}

export interface IMutation {
    updateFolderName(folder_id: number, foldername?: Nullable<string>): Nullable<Folder> | Promise<Nullable<Folder>>;
}

type Nullable<T> = T | null;
