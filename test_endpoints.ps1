# ==============================================================================
# EduPulse - Quick API Verification Script
# Run this script while EduPulse is running on http://localhost:8080
# ==============================================================================

$baseUrl = "http://localhost:8080/api"

Write-Host "`n--- 1. Testing GET /api/students ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/students" -Method Get | ConvertTo-Json -Depth 3

Write-Host "`n--- 2. Testing GET /api/students/1 ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/students/1" -Method Get | ConvertTo-Json -Depth 3

Write-Host "`n--- 3. Testing GET /api/performance/student/1 ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/performance/student/1" -Method Get | ConvertTo-Json -Depth 3

Write-Host "`n--- 4. Testing GET /api/analysis/student/1 ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/analysis/student/1" -Method Get | ConvertTo-Json -Depth 3

Write-Host "`n--- 5. Testing POST /api/ai/recommendation/1 ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/ai/recommendation/1" -Method Post | ConvertTo-Json -Depth 3
