import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { CatalogPage } from '@/features/catalog/page'
import { GoogleMark } from '@/components/design/google-mark'
import { Brand } from '@/components/layout/shell'
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
  const dialog = useRef<HTMLDialogElement>(null)
  const [visible, setVisible] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
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
      <div className="auth-background" aria-hidden="true" inert>
        <CatalogPage
          search={{ q: '', category: '', rarity: '', sort: 'newest', page: 1 }}
          onSearch={() => {}}
        />
      </div>
      <dialog
        ref={dialog}
        className={`auth-dialog ${registerMode ? 'register-dialog' : 'login-dialog'}`}
        aria-labelledby="auth-title"
        onCancel={(event) => {
          event.preventDefault()
          void navigate({ to: '/' })
        }}
      >
        <button
          className="auth-close"
          aria-label="Fechar"
          onClick={() => void navigate({ to: '/' })}
        >
          <X size={18} />
        </button>
        <Brand />
        <nav className="auth-tabs" aria-label="Acesso à conta">
          <Link to="/login" search={{ redirect: destination }}>
            Entrar
          </Link>
          <Link to="/register" search={{ redirect: destination }}>
            Criar conta
          </Link>
        </nav>
        <h1 id="auth-title">{registerMode ? 'Criar conta' : 'Entrar'}</h1>
        <form
          noValidate
          onSubmit={handleSubmit(async (input) => {
            if (registerMode && confirmation !== input.password) {
              setError('password', {
                message: 'As senhas precisam ser iguais.',
              })
              return
            }
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
              <span className="sr-only">Nome</span>
              <input
                placeholder="Seu nome"
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
            <span className="sr-only">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="contato@email.com"
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            <span id="email-error" className="field-error">
              {errors.email?.message}
            </span>
          </label>
          <label className="field">
            <span className="sr-only">Senha</span>
            <span className="password-input">
              <input
                placeholder="Sua senha"
                type={visible ? 'text' : 'password'}
                autoComplete={
                  registerMode ? 'new-password' : 'current-password'
                }
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              <button
                type="button"
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff /> : <Eye />}
              </button>
            </span>
            <span id="password-error" className="field-error">
              {errors.password?.message}
            </span>
          </label>
          {registerMode && (
            <label className="field">
              <span className="sr-only">Confirmar senha</span>
              <input
                placeholder="Confirmar senha"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </label>
          )}
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
        <p className="auth-switch">
          {registerMode ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
          <Link
            className="text-link"
            to={registerMode ? '/login' : '/register'}
            search={{ redirect: destination }}
          >
            {registerMode ? 'Entrar' : 'Cadastre-se'}
          </Link>
        </p>
        <div className="auth-divider">ou entre com</div>
        <div className="social-auth">
          <button disabled title="Integração indisponível nesta demonstração">
            <GoogleMark />
            Continuar com Google
          </button>
          <button disabled title="Integração indisponível nesta demonstração">
            <img src="/figma/5561e.svg" alt="" />
            Continuar com Facebook
          </button>
        </div>
      </dialog>
    </main>
  )
}
