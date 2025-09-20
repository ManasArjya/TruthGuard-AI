import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Clock } from 'lucide-react'

interface VerdictBadgeProps {
  verdict?: 'true' | 'false' | 'misleading' | 'uncertain'
  confidence?: number
  processing?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function VerdictBadge({ 
  verdict, 
  confidence, 
  processing = false,
  size = 'md' 
}: VerdictBadgeProps) {
  if (processing) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
        <Clock className="w-4 h-4 mr-2 animate-spin" />
        Processing...
      </div>
    )
  }

  if (!verdict) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
        <HelpCircle className="w-4 h-4 mr-2" />
        No Analysis
      </div>
    )
  }

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return {
          icon: CheckCircle,
          label: 'True',
          className: 'verdict-true',
          color: 'text-success-700'
        }
      case 'false':
        return {
          icon: XCircle,
          label: 'False',
          className: 'verdict-false',
          color: 'text-danger-700'
        }
      case 'misleading':
        return {
          icon: AlertTriangle,
          label: 'Misleading',
          className: 'verdict-misleading',
          color: 'text-warning-700'
        }
      case 'uncertain':
      default:
        return {
          icon: HelpCircle,
          label: 'Uncertain',
          className: 'verdict-uncertain',
          color: 'text-slate-700'
        }
    }
  }

  const config = getVerdictConfig(verdict)
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  return (
    <div className={`inline-flex items-center rounded-full border ${config.className} ${sizeClasses[size]} transition-all hover:shadow-sm`}>
      <Icon className={`mr-2 ${iconSizes[size]} ${config.color}`} />
      <span className="font-medium">{config.label}</span>
      {typeof confidence === 'number' && (
        <span className="ml-2 text-xs opacity-75">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </div>
  )
}