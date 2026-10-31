import axios from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '@/contracts'
import { errorMessage } from './api'
export function applyFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
) {
  if (axios.isAxiosError<ApiError>(error)) {
    for (const [field, messages] of Object.entries(
      error.response?.data?.fieldErrors ?? {},
    ))
      setError(field as Path<T>, { type: 'server', message: messages[0] })
  }
  setError('root', { message: errorMessage(error) })
}
