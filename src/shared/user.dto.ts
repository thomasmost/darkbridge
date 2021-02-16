import { ContractorProfileAttributes } from '../models/contractor_profile.model';

export interface IUserDto {
  id: string;
  created_at: number;
  family_name?: string;
  given_name?: string;
  email: string;
  phone?: string;
  contractor_profile?: ContractorProfileAttributes;
}

export interface UserUpdateFields {
  family_name?: string;
  given_name?: string;
  phone?: string;
}
