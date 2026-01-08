<#
Starts ngrok (using ngrok.yml) and then starts the Node server.
Loads environment variables from .env into the PowerShell session before starting processes.
#>

# Load .env into environment variables (simple parser)
if (Test-Path -Path .env) {
  Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
      $parts = $line -split '=', 2
      if ($parts.Count -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        $existing = (Get-Item -Path Env:$name -ErrorAction SilentlyContinue).Value
        if (-not $existing) { Set-Item -Path Env:$name -Value $value }
      }
    }
  }
} else {
  Write-Host "No .env file found in $(Get-Location). Continuing..." -ForegroundColor Yellow
}

# Ensure ngrok is available
$ngrokCmd = "ngrok"
try {
  & $ngrokCmd version > $null 2>&1
} catch {
  Write-Host "ngrok not found in PATH. Please install ngrok and ensure it's on PATH." -ForegroundColor Red
  exit 1
}

Write-Host "Starting ngrok (background)..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath $ngrokCmd -ArgumentList "start --config ngrok.yml --all" -WindowStyle Hidden
Start-Sleep -Seconds 1

Write-Host "Starting Node server (foreground)..." -ForegroundColor Cyan
npm start
