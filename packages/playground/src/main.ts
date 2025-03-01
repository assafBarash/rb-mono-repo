import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const UserSchema = Type.Object({
  name: Type.String(),
  age: Type.Number()
});

type User = Static<typeof UserSchema>;

export const main = async (): Promise<User> => {
  Value.Assert(UserSchema, { name: 'John', age: 42 });

  return { name: 'John', age: 42 };
};
