import { AccountSidebar } from '@/components/layout/account-sidebar'
import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { profileSchema, passwordSchema } from '@/contracts'
import type { User } from '@/contracts'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { applyFormErrors } from '@/lib/form-errors'
import { useSession } from '@/features/auth/use-session'
import { sessionOptions } from '@/features/auth/session'
import { profileOptions } from './queries'
import { Loading, ErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
function ProfileForm({ user }: { user: User }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  })
  const mutation = useMutation({
    mutationFn: async (input: z.infer<typeof profileSchema>) =>
      (await api.put<User>('/profile', input)).data,
    onSuccess: (result) => {
      queryClient.setQueryData(profileOptions(user.id).queryKey, result)
      queryClient.setQueryData(sessionOptions().queryKey, result)
      toast.success('Perfil atualizado.')
    },
    onError: (error) => applyFormErrors(error, setError),
  })
  const avatar = useWatch({ control, name: 'avatar' })
  return (
    <form
      className="panel profile-panel"
      noValidate
      onSubmit={handleSubmit((input) => mutation.mutate(input))}
    >
      <h2>Perfil do colecionador</h2>
      <div className="profile-form-fields">
        {' '}
        {(['name', 'email'] as const).map((field) => (
          <label className="field" key={field}>
            {field === 'name' ? 'Nome' : 'E-mail'}
            <input
              type={field === 'email' ? 'email' : 'text'}
              {...register(field)}
              aria-invalid={!!errors[field]}
              aria-describedby={`${field}-error`}
            />
            <span id={`${field}-error`} className="field-error">
              {errors[field]?.message}
            </span>
          </label>
        ))}
        {(['username', 'ens', 'walletAlias'] as const).map((field) => (
          <label className="field" key={field}>
            {field === 'username'
              ? 'Nome de usuário'
              : field === 'ens'
                ? 'Nome ENS'
                : 'Apelido da carteira'}
            <input
              {...register(field)}
              placeholder={field === 'ens' ? 'seunome.eth' : undefined}
            />
          </label>
        ))}{' '}
        <div className="profile-avatar">
          {avatar ? (
            <img src={avatar} alt="Seu avatar" width={80} height={80} />
          ) : (
            <span>{user.name[0]}</span>
          )}
          <div className="avatar-controls">
            <Button type="button" onClick={() => fileInput.current?.click()}>
              Alterar foto
            </Button>
            <p role="status">
              {fileName ||
                (avatar ? 'Imagem do perfil' : 'PNG, JPEG ou WebP · até 1 MB')}
            </p>
            <input
              ref={fileInput}
              tabIndex={-1}
              aria-label="Selecionar imagem do perfil"
              className="file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 1024 * 1024) {
                  setError('avatar', { message: 'Use uma imagem de até 1 MB.' })
                  return
                }
                setFileName(file.name)
                const reader = new FileReader()
                reader.onload = () =>
                  setValue('avatar', String(reader.result), {
                    shouldValidate: true,
                  })
                reader.readAsDataURL(file)
              }}
            />
          </div>
        </div>
        <p className="field-error" role="status">
          {errors.avatar?.message}
        </p>
      </div>{' '}
      {errors.root && (
        <p role="alert" className="field-error">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </form>
  )
}
function PasswordForm() {
  const [confirmation, setConfirmation] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })
  const mutation = useMutation({
    mutationFn: (input: z.infer<typeof passwordSchema>) =>
      api.put('/password', input),
    onSuccess: () => {
      reset()
      setConfirmation('')
      toast.success('Senha alterada.')
    },
    onError: (error) => applyFormErrors(error, setError),
  })
  return (
    <form
      className="panel password-panel"
      noValidate
      onSubmit={handleSubmit((input) => {
        if (input.password !== confirmation) {
          setError('password', { message: 'As senhas precisam ser iguais.' })
          return
        }
        mutation.mutate(input)
      })}
    >
      <h2>Alterar senha</h2>
      {(['currentPassword', 'password'] as const).map((field) => (
        <label className="field" key={field}>
          {field === 'password' ? 'Nova senha' : 'Senha atual'}
          <input
            type="password"
            autoComplete={
              field === 'password' ? 'new-password' : 'current-password'
            }
            {...register(field)}
            aria-invalid={!!errors[field]}
            aria-describedby={`${field}-error`}
          />
          <span className="field-error" id={`${field}-error`}>
            {errors[field]?.message}
          </span>
        </label>
      ))}
      <label className="field">
        Confirmar nova senha
        <input
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </label>
      {errors.root && (
        <p role="alert" className="field-error">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={mutation.isPending}>
        Alterar senha
      </Button>
    </form>
  )
}
export function ProfilePage() {
  const { data: user } = useSession()
  const query = useQuery(profileOptions(user?.id))
  return (
    <main className="page account-layout">
      <AccountSidebar />
      <div className="account-main">
        <div className="page-heading sr-only">
          <h1>
            Meu perfil<span>.</span>
          </h1>
          <p>Cuide da sua conta e da sua coleção.</p>
          <Link className="text-link" to="/wallets">
            Gerenciar carteiras →
          </Link>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : (
          query.data && (
            <div className="two-columns">
              <ProfileForm user={query.data} />
              <PasswordForm />
            </div>
          )
        )}
      </div>
    </main>
  )
}
