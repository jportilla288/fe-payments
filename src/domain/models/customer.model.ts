import { DocumentType } from '../enums';

export interface CustomerInput {
  readonly email: string;
  readonly fullName: string;
  readonly document: string;
  readonly documentType: DocumentType;
  readonly phoneNumber: string;
}
