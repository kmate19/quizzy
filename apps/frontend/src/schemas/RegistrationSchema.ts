import zod from 'zod';

export const baseRegisterSchema = zod.object({
  email: zod.string()
    .min(1, { message: 'A mező kitöltése kötelező' })
    .email({ message: 'Helytelen formátum' }),
  username: zod.string()
    .min(1,{message: 'A mező kitöltése kötelező'})
    .max(16,{message: 'Maximum 16 karaktert tartalmazhat'}),
  password: zod.string()
    .min(1, { message: 'A mező kitöltése kötelező' })
    .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia' })
    .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt' })
    .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert' })
    .regex(/\d/, { message: 'Tartalmaznia kell számot' }),
  confirmPassword: zod.string()
    .min(1, { message: 'A mező kitöltése kötelező' })
    .min(8, { message: 'Minimum 8 karaktert kell tartalmaznia' })
    .regex(/[a-z]/, { message: 'Tartalmaznia kell kisbetűt' })
    .regex(/[A-Z]/, { message: 'Tartalmaznia kell nagybetűt' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Tartalmaznia kell speciális karaktert' })
    .regex(/\d/, { message: 'Tartalmaznia kell számot' }),
});

