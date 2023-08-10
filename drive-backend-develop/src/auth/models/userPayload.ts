export interface UserPayload {
  sub: number;
  email: string;
  nome: string;
  grupo: number;
  iat?: number;
  exp?: number;
}
