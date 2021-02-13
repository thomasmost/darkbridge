export interface IUserDto {
  id: string;
  created_at: number;
  family_name?: string;
  given_name?: string;
  email: string;
  phone?: string;
}
