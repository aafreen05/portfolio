/**
 * Shared shape of every admin server action result.
 *
 * Kept in its own module — with no server-only imports — because the client
 * forms need the type and the idle value, while the helpers that build these
 * results live in `action-utils.ts` and must never reach the browser bundle.
 */
export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Set by create actions so the client can redirect to the new record. */
  id?: string;
}

export const idleState: ActionState = { ok: false, message: "" };
