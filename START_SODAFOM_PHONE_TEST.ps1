$ErrorActionPreference = 'Stop'
$Project = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Project

Write-Host ''
Write-Host '=== Sodafom phone backend + Android refresh ===' -ForegroundColor Cyan

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
}

$envText = Get-Content '.env' -Raw
$keyMatch = [regex]::Match($envText, '(?m)^OPENAI_API_KEY=(.+)$')
$key = if ($keyMatch.Success) { $keyMatch.Groups[1].Value.Trim() } else { '' }
if ([string]::IsNullOrWhiteSpace($key) -or $key -match 'PUT_NEW_KEY_HERE|PUT_ME_KEY_HERE|your_key_here') {
  Write-Host ''
  Write-Host 'OPENAI_API_KEY is not set in .env.' -ForegroundColor Yellow
  Write-Host 'Your key is deliberately not stored inside shared ZIP files.' -ForegroundColor Yellow
  Write-Host 'Put your current OpenAI key into .env, save it, then run this file again.' -ForegroundColor Yellow
  Start-Process notepad.exe (Join-Path $Project '.env')
  exit 2
}

# Prefer the active Wi-Fi adapter, then any active private IPv4 address.
$ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notmatch '^127\.' -and
    $_.IPAddress -notmatch '^169\.254\.' -and
    $_.InterfaceAlias -match 'Wi-?Fi|Wireless'
  } |
  Sort-Object InterfaceMetric |
  Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
  $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -match '^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)'
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $ip) { throw 'Could not find the laptop IPv4 address.' }
$apiUrl = "http://${ip}:5000"
Write-Host "Laptop backend address: $apiUrl" -ForegroundColor Green

function Set-EnvValue([string]$Path, [string]$Name, [string]$Value) {
  if (-not (Test-Path $Path)) { New-Item -ItemType File -Path $Path -Force | Out-Null }
  $content = Get-Content $Path -Raw
  if ($content -match "(?m)^$([regex]::Escape($Name))=") {
    $content = [regex]::Replace($content, "(?m)^$([regex]::Escape($Name))=.*$", "$Name=$Value")
  } else {
    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { $content += "`r`n" }
    $content += "$Name=$Value`r`n"
  }
  Set-Content -Path $Path -Value $content -NoNewline
}

Set-EnvValue '.env' 'VITE_API_BASE_URL' $apiUrl
if (-not (Test-Path 'android/.env')) { Copy-Item '.env' 'android/.env' }
Set-EnvValue 'android/.env' 'VITE_API_BASE_URL' $apiUrl
# Never need the API key in the Android project; keep the secret server-side only.
$androidEnv = Get-Content 'android/.env' -Raw
$androidEnv = [regex]::Replace($androidEnv, '(?m)^OPENAI_API_KEY=.*$', 'OPENAI_API_KEY=SERVER_SIDE_ONLY')
Set-Content 'android/.env' $androidEnv -NoNewline

Write-Host ''
Write-Host 'Building the web + backend...' -ForegroundColor Cyan
npm run build

Write-Host ''
Write-Host 'Refreshing Android app files...' -ForegroundColor Cyan
npx cap sync android

# Stop any old server using port 5000 so there is only one backend.
$old = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($old) {
  Write-Host "Stopping old backend process $($old.OwningProcess)..." -ForegroundColor Yellow
  Stop-Process -Id $old.OwningProcess -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 500
}

Write-Host ''
Write-Host 'Starting backend in a separate window...' -ForegroundColor Cyan
$serverCmd = "Set-Location '$Project'; `$env:PORT='5000'; `$env:HOST='0.0.0.0'; node --env-file=.env dist/server.bundle.mjs"
Start-Process powershell.exe -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-Command',$serverCmd

Start-Sleep -Seconds 3
try {
  $health = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:5000/api/chat-ping' -TimeoutSec 10
  Write-Host ''
  Write-Host "Backend check: $($health.Content)" -ForegroundColor Green
} catch {
  Write-Host ''
  Write-Host 'Backend did not answer the health check. Leave the server window open and read its red error.' -ForegroundColor Red
  throw
}

Write-Host ''
Write-Host 'READY FOR PHONE TEST' -ForegroundColor Green
Write-Host "Android app now points to $apiUrl" -ForegroundColor Green
Write-Host 'Open the android folder in Android Studio and press the green Run triangle.' -ForegroundColor Green
Write-Host 'Keep this laptop and the phone on the same Wi-Fi while using the local backend.' -ForegroundColor Yellow
