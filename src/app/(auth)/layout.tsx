import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-fusion-green-50 via-white to-fusion-charcoal-50 px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/fusion_logo.png"
          alt="Fusion - Building Values"
          width={220}
          height={110}
          priority
        />
        <p className="text-sm font-medium text-muted-foreground">
          Blessing Homz Pvt Ltd
        </p>
      </div>
      {children}
    </div>
  )
}
