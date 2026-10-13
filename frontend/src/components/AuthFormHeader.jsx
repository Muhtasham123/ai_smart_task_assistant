// The three lines that open every account form: small brand label,
// big heading, and one supporting sentence.

function AuthFormHeader({ eyebrow = 'WELCOME TO MOMENTUM', title, description }) {
  return (
    <>
      <p className="text-tiny text-brand">{eyebrow}</p>
      <h1 className="w-full text-h1 text-ink">{title}</h1>
      <p className="w-full text-body text-muted">{description}</p>
    </>
  )
}

export default AuthFormHeader
