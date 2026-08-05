"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = {};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, pending] = useActionState(isSignUp ? signUpAction : signInAction, initialState);

  return (
    <div className="w-full rounded-3xl border border-stone-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
      <p className="text-sm font-semibold text-amber-700">Council administration</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isSignUp ? "Register with your council email to get started." : "Enter your credentials to access the dashboard."}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        {isSignUp ? <Field autoComplete="name" label="Full name" name="name" placeholder="John Smith" type="text" /> : null}
        <Field autoComplete="email" label="Email address" name="email" placeholder="you@example.com" type="email" />
        <Field autoComplete={isSignUp ? "new-password" : "current-password"} label="Password" minLength={8} name="password" placeholder="At least 8 characters" type="password" />

        {state.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
        ) : null}

        <button className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <Link className="font-semibold text-amber-700 hover:text-amber-800" href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}

type FieldProps = {
  autoComplete: string;
  label: string;
  minLength?: number;
  name: string;
  placeholder: string;
  type: "email" | "password" | "text";
};

function Field({ autoComplete, label, minLength, name, placeholder, type }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input autoComplete={autoComplete} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20" minLength={minLength} name={name} placeholder={placeholder} required type={type} />
    </label>
  );
}
