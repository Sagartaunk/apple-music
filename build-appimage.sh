set -e
echo "1) installing dependencies (this may download ~100MB+)"
npm install


echo "2) building AppImage"
# This will produce the AppImage in the 'dist/' folder
npm run dist


echo "Done. Find the AppImage under ./dist/"
