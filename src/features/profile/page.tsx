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
      className="panel"
      noValidate
      onSubmit={handleSubmit((input) => mutation.mutate(input))}
    >
      <h2>Informações pessoais</h2>
      <div className="profile-avatar">
        {avatar ? (
          <img src={avatar} alt="Seu avatar" width={80} height={80} />
        ) : (
          <span>{user.name[0]}</span>
        )}
        <label className="text-link">
          Alterar foto
          <input
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
              const reader = new FileReader()
              reader.onload = () =>
                setValue('avatar', String(reader.result), {
                  shouldValidate: true,
                })
              reader.readAsDataURL(file)
            }}
          />
        </label>
      </div>
      <p className="field-error" role="status">
        {errors.avatar?.message}
      </p>
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
      toast.success('Senha alterada.')
    },
    onError: (error) => applyFormErrors(error, setError),
  })
  return (
    <form
      className="panel"
      noValidate
      onSubmit={handleSubmit((input) => mutation.mutate(input))}
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
    <main className="page">
      <div className="page-heading">
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
    </main>
  )
}
