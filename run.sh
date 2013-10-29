LOG_FILE="serverlog"
PORT=8000

echo "Parsing plist files."
mkdir -p gen
python plist_parser_custom.py /Library/Receipts/InstallHistory.plist > gen/json_file_custom.json

echo "Killing old server instances..."
ps -ef | grep "SimpleHTTPServer" | awk '{print $2}' | xargs kill 2>/dev/null

echo "Starting new local server...."
python -m SimpleHTTPServer $PORT &> serverlog &

echo "Started server on port $PORT"
echo "View the timeline at http://localhost:8000/timeline.html"
