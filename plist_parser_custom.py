import datetime
import json
import plistlib
import re
import sys
import urllib2

'''
NOTE: This is tuned to parse only //Library/Receipts/InstallHistory.plist for
now.
'''
# /Library/Preferences/com.apple.iPod.plist

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

    if 'DNS' in plist[i]['Services'][0]:
      ip = plist[i]['Services'][0]['DNS']['ServerAddresses'][0]

      downloaded_data  = urllib2.urlopen(
          'http://api.hostip.info/get_html.php?ip=' +
          ip +
          '&position=true'
      )

      data = downloaded_data.read()
      country = re.search('Country: (.*?)\n', data).group(1)
      if "Private" in country:
        continue

      if "Unknown" in country:
        continue

      if not country:
        continue

      city = re.search('City: (.*?)\n', data).group(1)
      latitude = re.search('Latitude: (.*?)\n', data).group(1)
      longitude = re.search('Longitude: (.*?)\n', data).group(1)

      event['title'] = city;

      event['description'] = "<p><b>Country: </b>" + country + "</p>"
      event['description'] += "<p><b>City: </b>" + city + "</p>"
      event['description'] += "<p><b>Latitude: </b>" + latitude + "</p>"
      event['description'] += "<p><b>Longitude: </b>" + longitude + "</p>"
    else:
      continue
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
