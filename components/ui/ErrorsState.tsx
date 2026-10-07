import "./errors-state.css"

interface Props {
  title:    string
  message:  string
  action?:  { label: string; href?: string; onClick?: () => void }
}

export function ErrorState({ title, message, action }: Props) {
  return (
    <div className="error-state">
      <div className="error-state__icon">⚠️</div>
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__message">{message}</p>
      {action && (
        action.href ? (
          <a href={action.href} className="btn btn--primary">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="btn btn--primary">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}