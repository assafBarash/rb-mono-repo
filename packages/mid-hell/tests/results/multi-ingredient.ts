import type { Literal as LiteralFromActions } from '../data/actions';
import type { Literal as LiteralFromPermissions } from '../data/permissions';
import type { Literal as LiteralFromStatus, AnotherLiteral } from '../data/status';
import type { Literal as LiteralFromUsers } from '../data/users';

// auto-generated::ts-literal-split
export type MultiIngredient = | LiteralFromActions
      | LiteralFromPermissions
      | LiteralFromStatus
      | AnotherLiteral
      | LiteralFromUsers;
