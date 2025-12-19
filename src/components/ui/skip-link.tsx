import { cn } from "@/lib/utils"

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function SkipLink({ className, href, children, ...props }: SkipLinkProps) {
  return (
    <a
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg",
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
}</content>
