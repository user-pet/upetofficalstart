@echo off
title uPet Local Test Server
set "PATH=C:\Users\inbar\.openagents\nodejs;%PATH%"
cd /d "C:\Users\inbar\Downloads\upetofficalstart-main\upetofficalstart-main"
echo Starting uPet dev server on http://lvh.me:8080 ...
start "" "http://lvh.me:8080/login"
"C:\Users\inbar\.openagents\nodejs\node.exe" "node_modules\vite\bin\vite.js" --host --port 8080
pause
