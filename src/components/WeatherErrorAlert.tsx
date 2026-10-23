import { AlertTriangle, KeyRound, RefreshCw } from "lucide-react"
import { MissingApiKeyError } from "@/api/weather"
import { getErrorMessage } from "@/lib/errors"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"

interface WeatherErrorAlertProps {
  error: unknown
  onRetry?: () => void
}

export function WeatherErrorAlert({ error, onRetry }: WeatherErrorAlertProps) {
  const missingKey = error instanceof MissingApiKeyError

  return (
    <Alert variant="destructive" className="max-w-2xl">
      {missingKey ? <KeyRound className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
      <AlertTitle className="text-xl">
        {missingKey ? "API key required" : "Error"}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-4 text-base sm:text-lg">
        <p>{getErrorMessage(error)}</p>
        {missingKey ? (
          <p className="text-sm sm:text-base">
            See the "Installation" section of the README for the full setup.
          </p>
        ) : (
          onRetry && (
            <Button variant="outline" onClick={onRetry} className="w-fit text-lg">
              <RefreshCw className="h-8 w-8" />
              Retry
            </Button>
          )
        )}
      </AlertDescription>
    </Alert>
  )
}
