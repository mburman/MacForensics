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

def createJSONTimeline(plist_file):
  plist = plistlib.readPlist(plist_file)
  unformatted_output = {
      'id':'install_history',
      'title':'Application Install History',
      'focus_date':'2011-06-28T10:58:29',
      'initial_zoom':'25',
      'timezone':'-05:30',
      'events':[]
  }

  # Create an event for each item.
  for i in range(0, len(plist)):
    event = {}
    event['id'] = "id" + str(i);
    event['title'] = plist[i]['displayName']
    event['startdate'] = plist[i]['date']
    event['importance'] = 40
    event['icon'] = "square_blue.png"
    event['date_display'] = 'day'

    unformatted_output['events'].append(event)

  print json.dumps([unformatted_output], default=dthandler)

if __name__ == '__main__':
  if (len(sys.argv) < 2):
    print "usage: ./plist_parser.py plistfile"
    sys.exit()

  createJSONTimeline(sys.argv[1])
