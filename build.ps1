# ============================================================
# HEALTHY & FRESH — build.ps1
# Regenera los archivos minificados (.min.css / .min.js) a partir
# de los fuentes. Ejecutar despues de editar css/*.css o js/*.js:
#   powershell -File build.ps1
# Las paginas cargan SOLO los .min — los fuentes son para editar.
# ============================================================
npx -y esbuild css/styles.css --minify --outfile=css/styles.min.css
npx -y esbuild css/menu.css   --minify --outfile=css/menu.min.css
npx -y esbuild js/app.js      --minify --outfile=js/app.min.js
npx -y esbuild js/menu.js     --minify --outfile=js/menu.min.js
Write-Output "Minificados regenerados."
