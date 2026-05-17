param()

$toolInput = $env:CLAUDE_TOOL_INPUT | ConvertFrom-Json
$agentType = $toolInput.subagent_type

$projectRoot  = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backendRoot  = Join-Path $projectRoot "backend"
$frontendRoot = Join-Path $projectRoot "frontend"

function Check-Backend {
    Write-Host "[Hook] backend-developer done -> running Kotlin compile check..."
    Push-Location $backendRoot
    try {
        $output   = & ".\gradlew.bat" compileKotlin 2>&1
        $exitCode = $LASTEXITCODE
        Write-Host ($output -join "`n")
        if ($exitCode -ne 0) {
            Write-Host ""
            Write-Host "[Hook ERROR] Backend compile FAILED - re-run backend-developer agent to fix errors"
            exit 2
        }
        Write-Host "[Hook] Backend compile OK"
    } finally {
        Pop-Location
    }
}

function Check-Frontend {
    Write-Host "[Hook] frontend-sub-agent done -> running TypeScript type check..."
    Push-Location $frontendRoot
    try {
        $output   = & npx tsc --noEmit 2>&1
        $exitCode = $LASTEXITCODE
        Write-Host ($output -join "`n")
        if ($exitCode -ne 0) {
            Write-Host ""
            Write-Host "[Hook ERROR] Frontend type check FAILED - re-run frontend-sub-agent to fix errors"
            exit 2
        }
        Write-Host "[Hook] Frontend type check OK"
    } finally {
        Pop-Location
    }
}

switch ($agentType) {
    'backend-developer'  { Check-Backend }
    'frontend-sub-agent' { Check-Frontend }
    default {
        $prompt = "$($toolInput.prompt)"
        if ($prompt -match 'backend|kotlin|spring') {
            Check-Backend
        } elseif ($prompt -match 'frontend|react|typescript') {
            Check-Frontend
        }
    }
}
