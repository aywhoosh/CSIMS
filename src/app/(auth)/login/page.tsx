import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to the Inventory Management System
          </p>
        </div>
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Construction Site Inventory Management System (WIP)
        <br />
        &copy; {new Date().getFullYear()} Fusion Limited
      </p>
    </div>
  )
}
