import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AsyncWrapper({ children, loadingMessage = 'Loading...', errorMessage = 'An error occurred. Please try again.' }) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all(
                    React.Children.map(children, (child) =>
                        child.type.fetchData ? child.type.fetchData() : Promise.resolve()
                    )
                )
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        loadData()
    }, [children])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>{loadingMessage}</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>{errorMessage}</p>
            </div>
        )
    }

    return <>{children}</>
}