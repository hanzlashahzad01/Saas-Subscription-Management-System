export const Card = ({ children, className = '', title, actions }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ${className} animate-fade-in`}>
      {(title || actions) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className={title || actions ? 'p-6' : 'p-6'}>{children}</div>
    </div>
  )
}

export const CardBody = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>
}

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
}

export default Card
