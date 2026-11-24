export function isValidValidationCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const pattern = /^(?:AVALIA|UPE-CPA)-[A-Z0-9]{5}-[A-Z0-9]{4}$/;
  return pattern.test(code.toUpperCase());
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function isValidCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
}

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/\D/g, '');

  return cleaned.length === 10 || cleaned.length === 11;
}

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isNotEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasMinLength(value: string, minLength: number): boolean {
  return typeof value === 'string' && value.length >= minLength;
}

export function hasMaxLength(value: string, maxLength: number): boolean {
  return typeof value === 'string' && value.length <= maxLength;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

export function isStrongPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    return false;
  }

  if (!/[a-z]/.test(password)) {
    return false;
  }

  if (!/[0-9]/.test(password)) {
    return false;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return false;
  }

  return true;
}

export function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return ['Senha é obrigatória'];
  }

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Pelo menos um caractere especial');
  }

  return errors;
}
