# Builds the site and uploads dist/ to Hostinger over FTP/FTPS.
# Setup: fill in the domain's FTP details in deploy.settings.ps1 (a copy of
# deploy.settings.example.ps1). Only the contents of dist/ are ever uploaded.
#
# Usage:
#   .\deploy.ps1              Build, then upload only the files that changed
#   .\deploy.ps1 -SkipBuild   Upload the existing dist/ without rebuilding
#   .\deploy.ps1 -Force       Re-upload every file regardless of earlier runs

param(
    [switch]$Force,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$DistRoot = Join-Path $ProjectRoot "dist"
$SettingsFile = Join-Path $ProjectRoot "deploy.settings.ps1"

if (-not (Test-Path $SettingsFile)) {
    Write-Host "Missing deploy.settings.ps1 - copy deploy.settings.example.ps1 to deploy.settings.ps1 and fill in your Hostinger FTP details first." -ForegroundColor Red
    exit 1
}
. $SettingsFile

if ($FtpHost -eq "ftp.example.com" -or $FtpUser -eq "your-ftp-username" -or $FtpPass -eq "your-ftp-password") {
    Write-Host "deploy.settings.ps1 still has the example values - fill in the real FTP host, username and password first." -ForegroundColor Red
    exit 1
}

if (-not $SkipBuild) {
    # npm prints warnings to stderr; only its exit code decides success.
    $ErrorActionPreference = "Continue"
    Push-Location $ProjectRoot
    npm run build
    $buildExit = $LASTEXITCODE
    Pop-Location
    $ErrorActionPreference = "Stop"
    if ($buildExit -ne 0) {
        Write-Host "Build failed - nothing was uploaded." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path (Join-Path $DistRoot "index.html"))) {
    Write-Host "dist/index.html not found - run npm run build first." -ForegroundColor Red
    exit 1
}

if ($UseFtps) {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

# Every build rewrites all of dist/, so files are compared by content hash
# rather than timestamp. The state is tied to the target, so pointing the
# settings at another server or folder uploads everything again.
$Target = "$FtpUser@$($FtpHost):$FtpPort$RemoteBasePath"
$StateFile = Join-Path $ProjectRoot "deploy.state.json"
$State = @{}
if ((Test-Path $StateFile) -and -not $Force) {
    try {
        $raw = Get-Content $StateFile -Raw | ConvertFrom-Json
        if ($raw.target -eq $Target) {
            $raw.files.PSObject.Properties | ForEach-Object { $State[$_.Name] = $_.Value }
        }
    } catch { $State = @{} }
}

function Get-RemoteUrl($relativePath) {
    $remotePath = ($RemoteBasePath.TrimEnd("/")) + "/" + ($relativePath -replace "\\", "/")
    return "ftp://$($FtpHost):$($FtpPort)$remotePath"
}

$madeDirs = @{}
function Ensure-RemoteDir($relativeDir) {
    if (-not $relativeDir -or $relativeDir -eq ".") { return }
    if ($madeDirs.ContainsKey($relativeDir)) { return }
    $parent = Split-Path $relativeDir -Parent
    if ($parent) { Ensure-RemoteDir $parent }

    $request = [System.Net.FtpWebRequest]::Create((Get-RemoteUrl $relativeDir))
    $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
    $request.EnableSsl = $UseFtps
    $request.UsePassive = $true
    $request.KeepAlive = $false
    $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    try {
        $response = $request.GetResponse()
        $response.Close()
    } catch [System.Net.WebException] {
        # 550 = already exists, which is fine. Close the error response so
        # its connection doesn't linger and block the next command.
        if ($_.Exception.Response) { $_.Exception.Response.Close() }
    }
    $madeDirs[$relativeDir] = $true
}

function Try-UploadOnce($localFile, $relativePath) {
    $request = [System.Net.FtpWebRequest]::Create((Get-RemoteUrl $relativePath))
    $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
    $request.EnableSsl = $UseFtps
    $request.UsePassive = $true
    $request.UseBinary = $true
    $request.KeepAlive = $false
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile

    $bytes = [System.IO.File]::ReadAllBytes($localFile)
    $request.ContentLength = $bytes.Length
    $stream = $request.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $response = $request.GetResponse()
    $response.Close()
}

# Create a folder only the first time an upload into it fails with 550, and
# retry transient "busy" errors from the host with a short backoff.
$knownGoodDirs = @{}
function Upload-File($localFile, $relativePath) {
    $dir = Split-Path $relativePath -Parent
    $maxAttempts = 4

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        try {
            Try-UploadOnce $localFile $relativePath
            return
        } catch {
            $message = $_.Exception.Message
            if ($_.Exception.Response) { $_.Exception.Response.Close() }

            if ($dir -and -not $knownGoodDirs.ContainsKey($dir) -and $message -match "550") {
                Ensure-RemoteDir $dir
                $knownGoodDirs[$dir] = $true
                continue
            }

            if ($attempt -eq $maxAttempts) { throw }
            Start-Sleep -Milliseconds (800 * $attempt)
        }
    }
}

# Assets go up before the HTML pages that reference them, so a visitor never
# gets a page whose new CSS/JS isn't on the server yet.
$files = Get-ChildItem -Path $DistRoot -Recurse -File |
    Sort-Object @{ Expression = { $_.Extension -eq ".html" } }, FullName

$uploaded = 0
$skipped = 0
$failed = 0

foreach ($file in $files) {
    $rel = $file.FullName.Substring($DistRoot.Length + 1)
    $stateKey = $rel -replace "\\", "/"
    $hash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash

    if ($State.ContainsKey($stateKey) -and $State[$stateKey] -eq $hash) {
        $skipped++
        continue
    }

    Start-Sleep -Milliseconds 150

    try {
        Upload-File $file.FullName $rel
        Write-Host "Uploaded: $stateKey" -ForegroundColor Green
        $State[$stateKey] = $hash
        $uploaded++
    } catch {
        if ($_.Exception.Response) { $_.Exception.Response.Close() }
        Write-Host "FAILED: $stateKey - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

@{ target = $Target; files = $State } | ConvertTo-Json -Depth 3 | Set-Content -Path $StateFile -Encoding utf8

Write-Host ""
Write-Host "Done. Uploaded $uploaded, skipped $skipped (unchanged), failed $failed." -ForegroundColor Cyan
if ($failed -gt 0) { exit 1 }
