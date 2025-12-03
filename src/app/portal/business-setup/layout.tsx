import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Business Setup | TaxHub',
    description: 'Set up your new business account and configure your entity details.',
}

export default function BusinessSetupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
