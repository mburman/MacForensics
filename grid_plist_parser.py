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
  unformatted_output = {'events':[], 'columns':[]}

  col1 = {}
  col1['name'] = "Install Date"
  col1['id'] = "date"
  col1['isDate'] = True
  unformatted_output['columns'].append(col1)

  col2 = {}
  col2['name'] = "Install Name"
  col2['id'] = "name"
  col2['isDate'] = False
  unformatted_output['columns'].append(col2)

  col3 = {}
  col3['name'] = "Version"
  col3['id'] = "version"
  col3['isDate'] = False
  unformatted_output['columns'].append(col3)

  col4 = {}
  col4['name'] = "Process"
  col4['id'] = "process"
  col4['isDate'] = False
  unformatted_output['columns'].append(col4)

  col5 = {}
  col5['name'] = "Packages"
  col5['id'] = "packages"
  col5['isDate'] = False
  unformatted_output['columns'].append(col5)

  # Create an event for each item.
  for i in range(0, len(plist)):
    event = {}
    event['date'] = plist[i]['date']
    event['name'] = plist[i]['displayName']

    if (plist[i]['displayVersion'] == ''):
      plist[i]['displayVersion'] = '-'
    event['version'] = plist[i]['displayVersion']
    event['process'] = plist[i]['processName']
    event['packages'] = ""
    for j in range(0, len(plist[i]['packageIdentifiers'])):
      event['packages'] += "<div>" + plist[i]['packageIdentifiers'][j] +"</div>"

    unformatted_output['events'].append(event)

  print json.dumps(unformatted_output, default=dthandler)

if __name__ == '__main__':
  if (len(sys.argv) < 2):
    print "usage: ./plist_parser_custom.py plistfile"
    sys.exit()

  parsePlistFile(sys.argv[1])
