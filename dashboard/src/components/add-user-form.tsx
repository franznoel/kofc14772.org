"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AddUserForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ error?: string; success?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage({});

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const result = await response.json() as { error?: string; success?: string };
      if (!response.ok) throw new Error(result.error || "Unable to add this user.");

      formRef.current?.reset();
      setMessage({ success: result.success });
      router.refresh();
    } catch (error) {
      setMessage({ error: error instanceof Error ? error.message : "Unable to add this user." });
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) {
    return <button className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700" onClick={() => setIsOpen(true)} type="button">Add user</button>;
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-amber-950">Add a dashboard user</h3><p className="mt-1 text-sm text-amber-900/80">Create an unverified account with an initial password.</p></div>
        <button aria-label="Close add user form" className="px-2 text-xl text-amber-800 hover:text-amber-950" onClick={() => setIsOpen(false)} type="button">×</button>
      </div>
      <form className="mt-5 grid gap-4 md:grid-cols-3" onSubmit={submit} ref={formRef}>
        <Field autoComplete="name" label="Name" name="name" placeholder="Full name" type="text" />
        <Field autoComplete="email" label="Email" name="email" placeholder="name@example.com" type="email" />
        <Field autoComplete="new-password" label="Initial password" minLength={8} name="password" placeholder="At least 8 characters" type="password" />
        <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className={`text-sm ${message.error ? "text-red-700" : "text-emerald-700"}`}>{message.error || message.success}</p>
          <button className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">{pending ? "Adding…" : "Create user"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <label className="text-sm font-medium text-amber-950">{label}<input {...props} className="mt-1.5 w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20" name={name} required /></label>;
}
