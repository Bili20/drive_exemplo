export interface IAnexo {
  id: number;
  titulo: string;
  dataCadastro: Date;
  descricao?: string;
  nome: string;
  capa?: string;
  url?: string;
  nomeOriginal: string;
  tipo: string;
  idTipo: number;
  tags?: ITag[];
}

export interface ITag {
  id: number;
  nome: string;
  foto?: string;
  categoria: boolean;
}
