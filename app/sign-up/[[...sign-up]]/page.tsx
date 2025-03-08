import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
            formButtonPrimary: "bg-primary hover:bg-primary/90",
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}

