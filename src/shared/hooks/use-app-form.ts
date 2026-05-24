import { createFormHook } from '@tanstack/react-form'
import { SubscribeButton, SwitchField, TextField } from '@ui/molecules'
import { fieldContext, formContext } from '@utils'

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SwitchField,
  },
  formComponents: { SubscribeButton },
})
