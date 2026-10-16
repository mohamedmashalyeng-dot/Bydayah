# Copy this file to deploy.settings.ps1 and fill in your real values.
# deploy.settings.ps1 holds the FTP password: it is never uploaded (only dist/
# is) and should never be shared or committed.

# From hPanel > Websites > (the domain) > Files > FTP Accounts. Either a
# hostname like "ftp.yourdomain.com" or the server's IP address.
$FtpHost = "ftp.example.com"

# FTP username, e.g. "u123456789.yourdomain.com" or "u123456789"
$FtpUser = "your-ftp-username"

$FtpPass = "your-ftp-password"

# 21 is standard FTP/FTPS. SFTP (port 65002) would need a different script.
$FtpPort = 21

# Hostinger supports explicit FTPS (encrypted). Keep $true unless it fails
# to connect, in which case try $false.
$UseFtps = $true

# The domain's web root, relative to where the FTP account lands. hPanel's
# FTP Accounts page shows it; commonly "/public_html". An extra FTP account
# created directly on public_html needs "/", and the main hosting account
# of a multi-site plan may need "/domains/yourdomain.com/public_html".
$RemoteBasePath = "/public_html"
