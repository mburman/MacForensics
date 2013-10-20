LOG_FILE="serverlog"
PORT=8000

echo "Parsing plist files."
mkdir gen
python plist_parser.py /Library/Receipts/InstallHistory.plist > gen/json_file.json

echo "Starting local server...."

python -m SimpleHTTPServer $PORT &> $LOG_FILE &

if [ $? -eq 0 ];
then
  echo "Started server on port $PORT"
  echo "View the timeline at http://localhost:8000/timeline.html"
else
  echo "Failed to start server. Something else is using port $PORT. Kill it and try again."
fi
