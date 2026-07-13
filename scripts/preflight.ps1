$ErrorActionPreference = "Continue"

$checks = @(
    @{ Name = "Git"; Command = "git"; Args = @("--version") },
    @{ Name = "Python"; Command = "python"; Args = @("--version") },
    @{ Name = "uv"; Command = "uv"; Args = @("--version") },
    @{ Name = "Node.js"; Command = "node"; Args = @("--version") },
    @{ Name = "npm"; Command = "npm"; Args = @("--version") },
    @{ Name = "Docker"; Command = "docker"; Args = @("--version") },
    @{ Name = "Docker Compose"; Command = "docker"; Args = @("compose", "version") }
)

$results = foreach ($check in $checks) {
    if (-not (Get-Command $check.Command -ErrorAction SilentlyContinue)) {
        [PSCustomObject]@{ Tool=$check.Name; Status="MISSING"; Version="" }
        continue
    }
    try {
        $output = & $check.Command @($check.Args) 2>&1 | Out-String
        [PSCustomObject]@{
            Tool=$check.Name
            Status=if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {"OK"} else {"ERROR"}
            Version=$output.Trim()
        }
    } catch {
        [PSCustomObject]@{ Tool=$check.Name; Status="ERROR"; Version=$_.Exception.Message }
    }
}

Write-Host "`nLeadFlow AI preflight" -ForegroundColor Cyan
$results | Format-Table -AutoSize

function Test-Port([int]$Port) {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {"IN USE"} else {"FREE"}
}

Write-Host "Ports:" -ForegroundColor Cyan
@(
    [PSCustomObject]@{Port=5173; Status=(Test-Port 5173)}
    [PSCustomObject]@{Port=8000; Status=(Test-Port 8000)}
) | Format-Table -AutoSize

if ($results | Where-Object {$_.Status -ne "OK"}) {
    Write-Host "Preflight failed." -ForegroundColor Red
    exit 1
}
Write-Host "Preflight passed." -ForegroundColor Green
