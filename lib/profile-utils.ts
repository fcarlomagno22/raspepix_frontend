export const maskCpfForDisplay = (cpf: string): string => {
  if (!cpf || cpf.length !== 11) return cpf // Expects unmasked 11 digits
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(9, 11)}`
}
