import datetime
import json
import plistlib
import sys

'''
NOTE: This is tuned to parse only //Library/Receipts/InstallHistory.plist for
now.
'''

# Arcane crap to json encode datetimes.
dthandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date) else None

def parsePlistFile(plist_file):
  plist = plistlib.readPlist(plist_file)
  if "installhistory" in plist_file.lower():
    parseInstallHistoryPlist(plist)
  else:
    parseNetworkSettingsPlist(plist)

def parseNetworkSettingsPlist(plist):
  unformatted_output = {'events':[]}

  plist = plist['Signatures']
  # Create an event for each item.
  for i in range(0, len(plist)):
    event = {}
    event['start'] = plist[i]['Timestamp']
    event['title'] = plist[i]['Identifier']

    unformatted_output['events'].append(event)

  print json.dumps(unformatted_output, default=dthandler)


def parseInstallHistoryPlist(plist):
  unformatted_output = {'events':[]}

  # Create an event for each item.
  for i in range(0, len(plist)):
    event = {}
    event['start'] = plist[i]['date']
    event['title'] = plist[i]['displayName']

    if (plist[i]['displayVersion'] == ''):
      plist[i]['displayVersion'] = '-'
    event['description'] = "<p><b>Version: </b>" + plist[i]['displayVersion'] + "</p>"
    event['description'] += "<p><b>Process: </b>" + plist[i]['processName'] + "</p>"
    event['description'] += "<p><b>Package Identifiers:</b></p>"
    for j in range(0, len(plist[i]['packageIdentifiers'])):
      event['description'] += "<div>" + plist[i]['packageIdentifiers'][j] +"</div>"

    unformatted_output['events'].append(event)

  print json.dumps(unformatted_output, default=dthandler)

if __name__ == '__main__':
  if (len(sys.argv) < 2):
    print "usage: ./plist_parser_custom.py plistfile"
    sys.exit()

  parsePlistFile(sys.argv[1])
