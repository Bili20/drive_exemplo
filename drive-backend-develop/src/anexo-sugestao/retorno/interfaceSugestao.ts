export interface ISugestao {
  id: number;
  file: string;
  capa?: string;
  nomeOriginal: string;
  titulo: string;
  descricao?: string;
  aprovado?: boolean;
  nome: string;
  tipoId: number;
  tipo: string;
}
