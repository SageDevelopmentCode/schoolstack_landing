interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide'
}

const sizeMap = {
  sm:   'max-w-[680px]',
  md:   'max-w-[860px]',
  lg:   'max-w-[1100px]',
  xl:   'max-w-[1200px]',
  wide: 'max-w-[1280px]',
}

export function Container({ children, className = '', size = 'xl' }: ContainerProps) {
  return (
    <div className={`${sizeMap[size]} mx-auto px-6 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}
