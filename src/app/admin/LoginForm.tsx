"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card mx-auto mt-8 max-w-sm p-7">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Admin password</span>
        <input type="password" name="password" required className="field" autoFocus />
      </label>
      {state?.error && <p className="mt-3 text-sm font-semibold text-coral">{state.error}</p>}
      <button type="submit" className="btn btn-ink mt-5 w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
