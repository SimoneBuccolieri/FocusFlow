"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const registerUser = async (e: any) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.push("/login?registered=true")
            } else {
                const errorData = await res.json()
                setError(errorData.message || "Registration failed")
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
            {/* Background Gradients */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="glass-card rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/10">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <User className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Join FocusFlow and start your journey
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={registerUser}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Full Name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Email address"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium border border-red-100 dark:border-red-900/50"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
