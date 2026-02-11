"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState("")

    const loginUser = async (e: any) => {
        e.preventDefault()
        signIn("credentials", {
            ...data,
            redirect: false,
        }).then((callback) => {
            if (callback?.error) {
                setError(callback.error)
            } else if (callback?.ok) {
                router.push("/")
            }
        })
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <div className="w-full max-w-md space-y-8 px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to FocusFlow
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={loginUser}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button
                        onClick={() => signIn("google")}
                        type="button"
                        className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.7-.0667-1.3833-.1833-2.0333H12.0003v3.85h4.8333c-.2 1.1-.8166 2.0333-1.7333 2.65v2.2h2.8c1.6333-1.5 2.5833-3.7166 2.5833-6.4 0-.4667-.05-1.15-.1333-1.8H12.0003v4.2333h4.4333c-.5666 2.9333-3.1333 5.1166-6.4333 5.1166-3.6333 0-6.5833-2.95-6.5833-6.5833s2.95-6.5833 6.5833-6.5833c1.6667 0 3.1667.6 4.35 1.7333l3.2333-3.2333C15.8669 1.7167 14.0503 1.05 12.0003 1.05 5.9503 1.05 1.0503 5.95 1.0503 12s4.9 10.95 10.95 10.95z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12.0003 4.2833c.8833 0 1.6833.3 2.3333.8l1.75-1.75c-1.1-1.0333-2.5167-1.6667-4.0833-1.6667-3.2667 0-6.1167 1.8333-7.4667 4.5167l2.5334 1.95c.9166-2.2833 3.1333-3.85 5.9333-3.85z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>
                </div>

                <p className="mt-2 text-center text-sm text-gray-600">
                    Not a member?{' '}
                    <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Register now
                    </Link>
                </p>
            </div>
        </div>
    )
}
