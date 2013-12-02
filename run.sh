LOG_FILE="serverlog"
PORT=8000

echo "Parsing plist files."
mkdir -p gen
python plist_parser_custom.py /Library/Receipts/InstallHistory.plist > gen/installedsoftware.json
python grid_plist_parser.py /Library/Receipts/InstallHistory.plist > gen/installedsoftware_grid.json
python plist_parser_custom.py /Library/Preferences/SystemConfiguration/com.apple.network.identification.plist > gen/network.json

echo "Killing old server instances..."
ps -ef | grep "SimpleHTTPServer" | awk '{print $2}' | xargs kill 2>/dev/null

echo "Starting new local server...."
python -m SimpleHTTPServer $PORT &> serverlog &

echo "Started server on port $PORT"
echo "View the timeline at http://localhost:8000/timeline.html"
