
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const Page = () => {

    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const checkUser = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/shop`,
                    {
                        credentials: "include"
                    }
                )

                console.log("Shop status:", res.status)

                if (!res.ok) {
                    router.replace("/login")
                    return
                }

                setLoading(false)

            } catch (err) {
                console.log("Authentication error:", err)
                router.replace("/login")
            }
        }

        checkUser()

    }, [router])

    if (loading) {
        return <h1>Checking authentication...</h1>
    }

    return (
        <div className="h-screen bg-zinc-800 text-white">
            <h1>This is shop</h1>
        </div>
    )
}

export default Page
