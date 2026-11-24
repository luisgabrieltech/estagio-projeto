import { PrismaClient, Role, FunctionalRole, FormStatus, ExternalStatus, Category, QuestionType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { getDemoSeedPassword } from './seed-config'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash(getDemoSeedPassword(process.env), 10)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.test' },
    update: {},
    create: {
      name: 'Administrador de Exemplo',
      email: 'admin@example.test',
      password: passwordHash,
      role: Role.ADMIN,
      functionalRoles: [],
      active: true,
      extraData: {
        department: 'Gestão de Avaliações',
        campus: 'Unidade Central',
      },
    },
  })
  console.log(`✅ Admin criado: ${admin.email}`)

  // CSA (Comissão Setorial de Avaliação)
  const csa = await prisma.user.upsert({
    where: { email: 'csa@example.test' },
    update: {},
    create: {
      name: 'Gestor de Exemplo',
      email: 'csa@example.test',
      password: passwordHash,
      role: Role.CSA,
      functionalRoles: [FunctionalRole.DOCENTE],
      active: true,
      extraData: {
        department: 'Unidade de Exemplo',
        campus: 'Unidade Central',
      },
    },
  })
  console.log(`✅ CSA criado: ${csa.email}`)

  // Docente
  const docente = await prisma.user.upsert({
    where: { email: 'docente@example.test' },
    update: {},
    create: {
      name: 'Professor Exemplo',
      email: 'docente@example.test',
      password: passwordHash,
      role: Role.USER,
      functionalRoles: [FunctionalRole.DOCENTE],
      active: true,
      extraData: {
        department: 'Computação',
        campus: 'Unidade Central',
        registration: 'DOC-12345',
      },
    },
  })
  console.log(`✅ Docente criado: ${docente.email}`)

  // Discente
  const discente = await prisma.user.upsert({
    where: { email: 'discente@example.test' },
    update: {},
    create: {
      name: 'Estudante Exemplo',
      email: 'discente@example.test',
      password: passwordHash,
      role: Role.USER,
      functionalRoles: [FunctionalRole.DISCENTE],
      active: true,
      extraData: {
        course: 'Engenharia de Software',
        campus: 'Unidade Central',
        registration: '2024.1.0001',
      },
    },
  })
  console.log(`✅ Discente criado: ${discente.email}`)

  // Egresso
  const egresso = await prisma.user.upsert({
    where: { email: 'egresso@example.test' },
    update: {},
    create: {
      name: 'Egresso Exemplo',
      email: 'egresso@example.test',
      password: passwordHash,
      role: Role.USER,
      functionalRoles: [FunctionalRole.EGRESSO],
      active: true,
      extraData: {
        course: 'Ciência da Computação',
        campus: 'Unidade Central',
        graduationYear: '2023',
      },
    },
  })
  console.log(`✅ Egresso criado: ${egresso.email}`)

  const form = await prisma.form.upsert({
    where: { id: 'demo-avaliacao-docentes' },
    update: {},
    create: {
      id: 'demo-avaliacao-docentes',
      title: 'Avaliação de Ambiente de Ensino',
      description: 'Pesquisa fictícia sobre a experiência de docentes na unidade de exemplo.',
      category: Category.DOCENTES,
      status: FormStatus.ACTIVE,
      externalStatus: ExternalStatus.AVAILABLE,
      estimatedTime: '15 minutos',
      generatesCertificate: true,
      certificateHours: '4 horas',
      createdById: csa.id,
      visibleToRoles: [FunctionalRole.DOCENTE],
    },
  })
  console.log(`✅ Formulário criado: ${form.title}`)

  const questions = [
    {
      id: 'demo-avaliacao-q1',
      customId: 'INFRA-01',
      text: 'Como você avalia a infraestrutura física do seu campus?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1', '2', '3', '4', '5'],
      rows: [],
      columns: [],
      order: 1,
      formId: form.id,
    },
    {
      id: 'demo-avaliacao-q2',
      customId: 'INFRA-02',
      text: 'Quais aspectos da infraestrutura precisam de melhorias?',
      type: QuestionType.CHECKBOX,
      required: false,
      options: ['Salas de aula', 'Laboratórios', 'Biblioteca', 'Banheiros', 'Estacionamento', 'Acessibilidade'],
      rows: [],
      columns: [],
      order: 2,
      formId: form.id,
    },
    {
      id: 'demo-avaliacao-q3',
      customId: 'ENSINO-01',
      text: 'Como você avalia o suporte pedagógico oferecido pela instituição?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1', '2', '3', '4', '5'],
      rows: [],
      columns: [],
      order: 3,
      formId: form.id,
    },
    {
      id: 'demo-avaliacao-q4',
      customId: 'ENSINO-02',
      text: 'Deixe suas sugestões para melhoria do ensino:',
      type: QuestionType.TEXT,
      required: false,
      options: [],
      rows: [],
      columns: [],
      order: 4,
      formId: form.id,
    },
    {
      id: 'demo-avaliacao-q5',
      customId: 'GERAL-01',
      text: 'De modo geral, qual seu nível de satisfação com o ambiente de ensino?',
      type: QuestionType.MULTIPLE_CHOICE,
      required: true,
      options: ['Muito satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito', 'Muito insatisfeito'],
      rows: [],
      columns: [],
      order: 5,
      formId: form.id,
    },
  ]

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {},
      create: question,
    })
  }
  console.log(`✅ ${questions.length} questões criadas`)

  console.log('\n📊 Resumo do seed:')
  console.log(`   - Usuários: 5 (admin, csa, docente, discente, egresso)`)
  console.log(`   - Formulários: 1`)
  console.log(`   - Questões: ${questions.length}`)
  console.log('\n🎉 Seed concluído com sucesso!')

}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
