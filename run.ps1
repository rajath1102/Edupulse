# ==============================================================================
# EduPulse - Quick Start PowerShell Script
# ==============================================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " Starting EDUPULSE Spring Boot Application... " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

$mvnPath = "$env:USERPROFILE\.m2\apache-maven-3.9.6\bin\mvn.cmd"

if (Test-Path $mvnPath) {
    & $mvnPath spring-boot:run
} else {
    mvn spring-boot:run
}
