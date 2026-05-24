'use client'

import { Button, type ButtonProps } from '@ui/atoms'
import { useFormContext } from '@utils'

export const SubscribeButton = (props: ButtonProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <Button type="submit" disabled={isSubmitting} {...props} />}
    </form.Subscribe>
  )
}

SubscribeButton.displayName = 'SubscribeButton'
