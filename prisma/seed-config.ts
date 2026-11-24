export function getDemoSeedPassword(env: Record<string, string | undefined>): string {
  if (env.NODE_ENV === 'production') {
    throw new Error('O seed de demonstração só pode ser executado fora de produção.')
  }

  const password = env.DEMO_SEED_PASSWORD
  if (!password || password.trim().length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error('Defina DEMO_SEED_PASSWORD com pelo menos 12 caracteres e até 72 bytes.')
  }

  return password
}
