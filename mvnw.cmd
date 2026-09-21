@echo off
REM ----------------------------------------------------------------------------
REM EduPulse - Maven Runner Script for Windows
REM ----------------------------------------------------------------------------
setlocal

IF EXIST "%USERPROFILE%\.m2\apache-maven-3.9.6\bin\mvn.cmd" (
    "%USERPROFILE%\.m2\apache-maven-3.9.6\bin\mvn.cmd" %*
) ELSE (
    mvn %*
)

endlocal
