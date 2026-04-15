export function hasMinPasswordLength(password: string) {
  return password.length >= 8;
}

export function hasPasswordUppercase(password: string) {
  return /[A-Z]/.test(password);
}

export function hasPasswordNumberOrSymbol(password: string) {
  return /[\d\W_]/.test(password);
}

export function isStrongPassword(password: string) {
  return (
    hasMinPasswordLength(password) &&
    hasPasswordUppercase(password) &&
    hasPasswordNumberOrSymbol(password)
  );
}
