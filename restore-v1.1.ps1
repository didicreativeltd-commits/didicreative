# 恢复版本 1.1 脚本
# 使用方法: 在 PowerShell 中运行: .\restore-v1.1.ps1

Write-Host "正在恢复版本 1.1..." -ForegroundColor Yellow

if (-not (Test-Path "backup-v1.1")) {
    Write-Host "错误: 找不到备份文件夹 backup-v1.1" -ForegroundColor Red
    exit 1
}

# 恢复所有文件
Copy-Item -Path "backup-v1.1\index.html" -Destination "." -Force
Copy-Item -Path "backup-v1.1\css" -Destination "." -Recurse -Force
Copy-Item -Path "backup-v1.1\js" -Destination "." -Recurse -Force
Copy-Item -Path "backup-v1.1\assets" -Destination "." -Recurse -Force
Copy-Item -Path "backup-v1.1\*.html" -Destination "." -Force -Exclude "index.html"
Copy-Item -Path "backup-v1.1\*.md" -Destination "." -Force
Copy-Item -Path "backup-v1.1\*.txt" -Destination "." -Force

Write-Host "版本 1.1 恢复完成！" -ForegroundColor Green


