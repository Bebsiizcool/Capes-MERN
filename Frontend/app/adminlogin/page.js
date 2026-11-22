
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

const AdminLogin = () => {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()

        // Connect your backend login API here
        console.log({ email, password })
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
                        <span className="text-white text-xl font-bold">A</span>
                    </div>

                    <h1 className="text-3xl font-semibold text-white">
                        Admin Portal
                    </h1>

                    <p className="text-zinc-500 mt-2 text-sm">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">

                    <form onSubmit={handleLogin} className="space-y-5">

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Email Address
                            </label>

                            <input
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">
                                Password
                            </label>

                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition duration-200"
                        >
                            Sign In
                        </button>

                    </form>

                    <p className="text-center text-xs text-zinc-600 mt-6">
                        Protected Admin Access
                    </p>

                </div>

                <p className="text-center text-zinc-600 text-xs mt-8">
                    © 2026 Admin Portal. All rights reserved.
                </p>

            </div>

        </div>
    )
}

export default AdminLogin
