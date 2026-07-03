import { test, expect } from './fixtures'
import { attemptLogin, requestPasswordReset, signUp } from './helpers/auth'

test.describe('Autenticação', () => {
  test('exibe tela de login', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Lista de Tarefas' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('entra na área de tarefas após login', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')
    await attemptLogin(page, 'e2e@test.com', 'senha-e2e')

    await expect(page.getByRole('button', { name: 'Nova tarefa' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')
    await attemptLogin(page, 'e2e@test.com', 'senha-errada')

    await expect(page.getByText('Invalid login credentials')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nova tarefa' })).not.toBeVisible()
  })

  test('cadastra nova conta e entra na área logada', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')
    await signUp(page, 'novo@test.com', '123456')

    await expect(page.getByRole('button', { name: 'Nova tarefa' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lista de Tarefas' })).not.toBeVisible()
  })

  test('envia recuperação de senha com sucesso', async ({ page, supabaseMock: _state }) => {
    await page.goto('/')
    await requestPasswordReset(page, 'e2e@test.com')

    await expect(
      page.getByText(
        'Se o e-mail estiver cadastrado, enviaremos um link de recuperação. Verifique sua caixa de entrada.'
      )
    ).toBeVisible()
  })
})
