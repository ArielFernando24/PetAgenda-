export const PET_SEX_VALUES = ["MACHO", "FEMEA", "NAO_INFORMADO"] as const;

export type PetSex = (typeof PET_SEX_VALUES)[number];

export interface Pet {
  id: string;
  tutorId: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: PetSex;
  dataNascimento: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetData {
  tutorId: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: PetSex;
  dataNascimento: string;
}

export type UpdatePetData = Partial<Omit<CreatePetData, "tutorId">>;
