param (
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$manifestPath = "manifest.json"
$readmePath = "README.md"

if (-not (Test-Path $manifestPath)) {
    Write-Error "manifest.json not found!"
    exit 1
}

# 1. Update manifest.json
$manifestJson = Get-Content $manifestPath -Raw | ConvertFrom-Json
$oldVersion = $manifestJson.version

Write-Host "Bumping version from $oldVersion to $Version..."

$manifestJson.version = $Version
$manifestJson.version_name = "$Version – Optimized & Enhanced" # You can customize this suffix pattern or pass it as an arg

$manifestJson | ConvertTo-Json -Depth 10 | Set-Content $manifestPath -Encoding UTF8
Write-Host "Updated manifest.json"

# 2. Update README.md (Shields.io Badge)
if (Test-Path $readmePath) {
    $readmeContent = Get-Content $readmePath -Raw
    # Regex to find the version badge URL and update it
    # Pattern: https://img.shields.io/badge/version-X.X.X-blue.svg
    $pattern = "version-[\d\.]+-blue\.svg"
    $replacement = "version-$Version-blue.svg"
    
    if ($readmeContent -match $pattern) {
        $newReadmeContent = $readmeContent -replace $pattern, $replacement
        Set-Content -Path $readmePath -Value $newReadmeContent -Encoding UTF8
        Write-Host "Updated README.md badge"
    } else {
        Write-Warning "Could not find version badge in README.md to update."
    }
} else {
    Write-Warning "README.md not found."
}

Write-Host "Done! Version bumped to $Version"
