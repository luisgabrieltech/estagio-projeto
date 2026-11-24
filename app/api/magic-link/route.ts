import { NextResponse } from 'next/server'

function retired() {
  return NextResponse.json({
    success: false,
    error: {
      code: 'GONE',
      message: 'O acesso por link foi desativado. Use o login com e-mail e senha.',
    },
  }, { status: 410 })
}

export const GET = retired
export const POST = retired
