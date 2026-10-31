import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { accountSchema } from '@/contracts'
import { authenticate } from './session'
import { applyFormErrors } from '@/lib/form-errors'
import { Button } from '@/components/ui/button'
export function AuthForm({
  mode,
  destination,
}: {
  mode: 'login' | 'register'
  destination: string
}) {
  const navigate = useNavigate()
  const registerMode = mode === 'register'
  const schema = registerMode
    ? accountSchema
    : accountSchema.extend({ name: z.string() })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })
  return (
    <main className="auth-page">
      <section className="auth-art">
        <img
          src="/art/art-4.svg"
          alt="Escultura digital abstrata"
          width={720}
          height={720}
        />
        <div>
          <span className="eyebrow">SEU PRÓXIMO MUNDO COMEÇA AQUI</span>
          <h2>
            Uma nova forma
            <br />
            de colecionar.
          </h2>
        </div>
      </section>
      <section className="auth-form">
        <span className="eyebrow">BEM-VINDO AO NFTMARKET</span>
        <h1>{registerMode ? 'Crie sua conta' : 'Bom ter você aqui.'}</h1>
        <p className="muted">
          {registerMode
            ? 'Encontre arte que combina com você.'
            : 'Entre para continuar sua coleção.'}
        </p>
        <form
          noValidate
          onSubmit={handleSubmit(async (input) => {
            try {
              await authenticate(mode, input)
              await navigate({ href: destination })
            } catch (error) {
              applyFormErrors(error, setError)
            }
          })}
        >
          {registerMode && (
            <label className="field">
              Nome
              <input
                autoComplete="name"
                {...register('name')}
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              <span id="name-error" className="field-error">
                {errors.name?.message}
              </span>
            </label>
          )}
          <label className="field">
            E-mail
            <input
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            <span id="email-error" className="field-error">
              {errors.email?.message}
            </span>
          </label>
          <label className="field">
            Senha
            <input
              type="password"
              autoComplete={registerMode ? 'new-password' : 'current-password'}
              {...register('password')}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
            />
            <span id="password-error" className="field-error">
              {errors.password?.message}
            </span>
          </label>
          {errors.root && (
            <p role="alert" className="field-error">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" className="wide" disabled={isSubmitting}>
            {isSubmitting
              ? 'Aguarde…'
              : registerMode
                ? 'Criar conta'
                : 'Entrar'}
          </Button>
        </form>
        <p>
          {registerMode ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
          <Link
            className="text-link"
            to={registerMode ? '/login' : '/register'}
            search={{ redirect: destination }}
          >
            {registerMode ? 'Entrar' : 'Cadastre-se'}
          </Link>
        </p>
      </section>
    </main>
  )
}
