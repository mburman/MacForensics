// Offset from the top of the canvas to the first item in the timeline.
var START_OFFSET = 50;

// Offset from the bottom of the canvas to the last item in the timeline.
var END_OFFSET = 50;

// Width of the timeline.
// TODO: couple this with CSS
var TIMELINE_WIDTH = 500;

var EVENTS_OFFSET = 30;

// Give each month n pixels.
var SCALE_SPACING = 40;

// TODO: FAR TOO MANY MAGIC NUMBERS. GET RID OF THEM!
//
// Holds a list of eventsm index of the event being displayed and the field in
// which it is displayed.
function EventDisplayData(events, eventDisplayedIndex, textField) {
  this.events = events;
  this.eventDisplayedIndex = eventDisplayedIndex;
  this.textField = textField;
}

function TimelineItem(events, title, descriptionTitle) {
  this.events = events;
  this.title = title;
  this.descriptionTitle = descriptionTitle;
}

// Indicates how an object was transformed.
// undoTransform is a function to undo the transform.
function Transform(object, undoTransform, properties) {
  this.object = object;
  this.undoTransform = undoTransform;
  this.properties = properties;
}

function undoTranslationTransform() {
  this.object.position.x -= this.properties['x'];
  this.object.position.y -= this.properties['y'];
}

function undoExistenceTransform() {
  this.object.remove();
}

function undoSizeTransform() {
  this.object.height -= this.properties['height'];
  this.object.width -= this.properties['width'];
}

function undoContentTransform() {
  this.object.content = this.properties['oldContent'];
}

// Holds all current transforms.
var currentTransforms = new Array();

// Display events as dots instead of in a text field.
function drawEventDots(events, index, SCALE_SPACING) {
  if (events.length == 0) {
    return;
  }

  var widthSpacing = 10;
  for (j = 0; j < events.length; j++) {
   var eventDate = new XDate(events[j].start);
    eventDay = eventDate.getDate() // returns 1 - 31
    daysInEventMonth = daysInMonth(eventDate.getMonth(),eventDate.getFullYear());

    offset = eventDay / daysInEventMonth;

    var point = new paper.Point(
      TIMELINE_WIDTH / 2 + j * widthSpacing + EVENTS_OFFSET,
      (index + offset) * SCALE_SPACING + START_OFFSET
    );

    var circle = new paper.Path.Circle(point, 3);
    circle.fillColor = Colors.circle.events;
  }
}

function addButtons(timeline, events, offset, i, title) {
  var buttonNext = new paper.Path.RegularPolygon(new paper.Point(TIMELINE_WIDTH / 2 + 35, offset + i * SCALE_SPACING + START_OFFSET), 3, 7);
  buttonNext.fillColor = Colors.arrow.default;
  buttonNext.rotate(90);
  timeline.children[i].addChild(buttonNext);

  var buttonPrevious = new paper.Path.RegularPolygon(new paper.Point(TIMELINE_WIDTH / 2 + 20, offset + i * SCALE_SPACING + START_OFFSET), 3, 7);
  buttonPrevious.fillColor = Colors.arrow.unclickable;
  buttonPrevious.rotate(-90);
  timeline.addChild(buttonPrevious);
  timeline.children[i].addChild(buttonPrevious);

  // Make buttons "unclickable" if there are no events to scroll through.
  if (events.length < 2) {
    buttonNext.fillColor = Colors.arrow.unclickable;
  }

  // Create a blob to hold this data so we can play with it.
  var displayData = new EventDisplayData(title.events, 0, title);
  buttonNext.data = displayData;
  buttonPrevious.data = displayData;
  buttonNext.previous = buttonPrevious;
  buttonPrevious.next = buttonNext;

  buttonNext.onMouseDown = function(event) {
    if (this.data.eventDisplayedIndex == (this.data.events.length-1)) {
      return;
    }

    this.fillColor = Colors.arrow.onMouseDown;

    // Display the next event.
    this.data.eventDisplayedIndex++;
    this.previous.fillColor = Colors.arrow.default;
    if (this.data.eventDisplayedIndex == this.data.events.length - 1) {
      this.fillColor = Colors.arrow.unclickable;
    }
    this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
    this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    if (this.data.events.length > 1) {
      this.data.textField.more.bounds.x = this.data.textField.bounds.x + this.data.textField.bounds.width + 3;
    }
  }

  buttonNext.onMouseUp = function(event) {
    if (this.data.eventDisplayedIndex == this.data.events.length-1) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }
    this.fillColor = Colors.arrow.default;
  }

  buttonNext.onMouseLeave = function(event) {
    if (this.data.eventDisplayedIndex == this.data.events.length-1) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }
    this.fillColor = Colors.arrow.default;
  }

  buttonPrevious.onMouseDown = function(event) {
    if (this.data.eventDisplayedIndex == 0) {
      return;
    }

    this.fillColor = Colors.arrow.onMouseDown;

    // Display the previous event.
    this.data.eventDisplayedIndex--;
    this.next.fillColor = Colors.arrow.default;
    this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
    this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    if (this.data.events.length > 1) {
      this.data.textField.more.bounds.x = this.data.textField.bounds.x + this.data.textField.bounds.width + 3;
    }
  }

  buttonPrevious.onMouseUp = function(event) {
    if (this.data.eventDisplayedIndex == 0) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }
    this.fillColor = Colors.arrow.default;
  }

  buttonPrevious.onMouseLeave = function(event) {
    if (this.data.eventDisplayedIndex == 0) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }
    this.fillColor = Colors.arrow.default;
  }
}

function drawEventList(timeline, events, index, SCALE_SPACING, offset, descriptionTitle) {
  if (events.length == 0) {
    return;
  }

  var title = new paper.PointText(
    new paper.Point(
      TIMELINE_WIDTH / 2 + 50,
      offset + index * SCALE_SPACING + START_OFFSET
    )
  );

  title.justification = 'left';
  title.fillColor = 'black';
  title.events = events;
  title.content = events[0].title;
  title.currentEvent = events[0];
  timeline.children[index].addChild(title);

  title.onMouseDown = function(event) {
    description = '<h2>' + this.currentEvent.title + '</h2><p><b>Date: </b>' + this.currentEvent.start.toUTCString() + '</p><p>'+ this.currentEvent.description + '</p>';
    $("div#description2").html(description);
  }

  // TO add or not to add...
  addButtons(timeline, events, offset, index, title)

  // If there aren't multiple events to show.
  if (events.length == 1) {
    return;
  }

  var more = new paper.PointText(
    new paper.Point(
      title.bounds.x + title.bounds.width + 4,
      offset + index * SCALE_SPACING + START_OFFSET
    )
  );

  more.justification = 'left';
  more.fillColor = 'green';
  more.events = events;
  more.content = '(...)';
  more.font = 'helvetica'
  more.timeline = timeline;
  more.descriptionTitle = descriptionTitle;

  more.onMouseEnter = function(event) {
    this.font = 'helvetica-bold'
  }

  more.onMouseLeave = function(event) {
    this.font = 'helvetica'
  }

  // Display a list of all events at that time.
  more.onMouseDown = function (event) {
    description = '<h2>Events on ' + this.descriptionTitle + '</h2><table>';
    for (var i = 0; i < this.events.length; i++) {
      description += '<tr><td>' + events[i].start.toUTCString() + '</td><td>' + events[i].title + '</td>';
    }

    description += "</table>";
    $("div#description").html(description);
  }

  timeline.children[index].addChild(more);
  title.more = more;
}


// Draws the timeline.
function drawTimeline(timelineItems, offset, timelineType) {
  // Length of the current timeline.
  var timelineLength = timelineItems.length * SCALE_SPACING;

  // Setup canvas.
  var canvas = document.getElementById("myCanvas");
  if (timelineType == TimelineType.month) {
    paper.setup(canvas);
  }

  var timeline = new paper.Group();

  // Draw month names.
  for (var i=0; i < timelineItems.length; i++) {
    var text = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 30,  offset + i * SCALE_SPACING + START_OFFSET));

    // Group for each timeline item.
    var itemGroup = new paper.Group();
    itemGroup.addChild(text);
    timeline.addChild(itemGroup);

    var titleText = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 130,  offset + i * SCALE_SPACING + START_OFFSET + 5));
    titleText.content = '-';
    titleText.style = {
      fillColor: '#dddddd',
      justification: 'center',
      fontSize: 30
    };

    if (timelineItems[i].titleText != undefined) {
      titleText.content = timelineItems[i].titleText;
      titleText.fillColor = '#bbbbbb';
    }

    itemGroup.addChild(titleText);

    text.content = timelineItems[i].title;
      text.style = {
      fillColor: '#444444',
      justification: 'right'
    };

    if (timelineItems[i].events.length > 0) {
      var expandSign = new paper.PointText(
        new paper.Point(
          text.bounds.x + text.bounds.width + 5,
          offset + i * SCALE_SPACING + START_OFFSET
        )
      );
      expandSign.style = {
        fillColor: Colors.timeline.expand,
        font: 'helvetica',
        fontSize: 15
      };
      expandSign.content = "+";
      expandSign.events = timelineItems[i].events;
      expandSign.i = i;

      itemGroup.addChild(expandSign);

      expandSign.onMouseEnter = function(event) {
        this.font = 'helvetica-bold';
      };

      expandSign.onMouseLeave = function(event) {
        this.font = 'helvetica';
      };

      expandSign.onMouseDown = function(event) {
        // TODO: gotta clean up... this is too messy.
        var previousGroup = null;
        if (currentTransforms.length > 0) {
          previousGroup = currentTransforms[0].object;
        }

        // Undo all current transforms.
        for (var j = 0; j < currentTransforms.length; j++) {
          currentTransforms[j].undoTransform();
        }
        currentTransforms = new Array();

        var month = this.events[0].start.getMonth();
        var year = this.events[0].start.getFullYear();
        translationAmount = daysInMonth(year, month);

        // handle this group appropriately since this is being expanded.
        var groupToMove = this.parent;

        // If the same title is being clicked, don't redraw.
        if ((previousGroup != null) && (groupToMove.id == previousGroup.id)) {
          return;
        }

        // For now... dummy transform
        var properties = {
          'x':0,
          'y':0
        }
        transform = new Transform(groupToMove, undoTranslationTransform, properties);
        currentTransforms.push(transform);

        // move all other groups down.
        groupToMove = groupToMove.nextSibling;
        while (groupToMove) {
          var properties = {
            'x':0,
            'y':SCALE_SPACING * translationAmount
          }
          transform = new Transform(groupToMove, undoTranslationTransform, properties);
          currentTransforms.push(transform);

          groupToMove.position.y += SCALE_SPACING * translationAmount;
          groupToMove = groupToMove.nextSibling;
        }

        nextOffset = (this.i + 1) * SCALE_SPACING;

        // TODO: Need to fix. Pass in a function and call that instead.
        group = drawTimelineWithDayGranularity(this.events, nextOffset);
        transform = new Transform(group, undoExistenceTransform, null);
        currentTransforms.push(transform);

        // Change + to -
        this.content = '-';
        var properties = {
          'newContent':'-',
          'oldContent':'+'
        }
        var contentTransform = new Transform(this, undoContentTransform, properties);
        currentTransforms.push(contentTransform);
      }
    }


    var path = new paper.Path();
    var start = new paper.Point(TIMELINE_WIDTH / 2,  offset + START_OFFSET / 2 + i * SCALE_SPACING);
    path.moveTo(start);
    path.lineTo(
      start.add(
        [ 0, START_OFFSET]
      )
    );
    path.strokeColor = Colors.timeline.line;
    path.strokeWidth = 2;
    path.strokeCap = 'round';

    var circle = new paper.Path.Circle(new paper.Point(TIMELINE_WIDTH / 2,  offset + i * SCALE_SPACING + START_OFFSET), 5);
    circle.fillColor = Colors.timeline.circle;

    itemGroup.addChild(path);
    itemGroup.addChild(circle);

    drawEventList(timeline, timelineItems[i].events, i, SCALE_SPACING, offset, timelineItems[i].descriptionTitle);
    //drawEventDots(text.events, i, SCALE_SPACING);
  }

  // Adjust canvas to appropriate size.
  if (timelineType == TimelineType.day) {
    canvas.height += timelineLength;
    paper.view.viewSize.height += canvas.height;

    // Create transforms - so we can undo them later.
    var properties = {
      'width': 0,
      'height': timelineLength
    }
    canvasTransform = new Transform(canvas, undoSizeTransform, properties);
    viewTransform = new Transform(paper.view.viewSize, undoSizeTransform, properties);
    currentTransforms.push(canvasTransform);
    currentTransforms.push(viewTransform);
  } else {
    canvas.height = timelineLength + START_OFFSET + END_OFFSET;
    paper.view.viewSize.height = canvas.height;
  }

  return timeline;

  // TODO: Figure out what this does.
//  paper.view.draw();
}

// NOTE: For now, the events must be of the same month.
function drawTimelineWithDayGranularity(sortedEvents, offset) {
  events = sortedEvents;
  numDays = daysInMonth(
    sortedEvents[0].start.getFullYear(),
    sortedEvents[0].start.getMonth()
  );

  timelineItems = new Array();
  for (var i=0; i < numDays; i++) {
    filteredEvents = getEventsInYearAndMonthAndDate(
      sortedEvents,
      sortedEvents[0].start.getFullYear(),
      sortedEvents[0].start.getMonth(),
      i + 1 // date index is from 1 - 31
    );

    itemTitle = (i + 1); // title is just the day number
    timelineItem = new TimelineItem(
      filteredEvents,
      itemTitle,
      i + " " + monthNames[sortedEvents[0].start.getMonth()] + " " + sortedEvents[0].start.getFullYear() // title of the description
    );
    timelineItems.push(timelineItem);
  }

  return drawTimeline(timelineItems, offset, TimelineType.day);
}

function drawTimelineWithMonthGranularity(sortedEvents, offset) {
  events = sortedEvents;
  var startYear = events[0].start.getFullYear();
  var endYear = events[events.length - 1].start.getFullYear();

  // Add 1 to change the index from 1 - 12.
  var startMonth = events[0].start.getMonth() + 1;
  var endMonth = events[events.length - 1].start.getMonth() + 1;
  var numMonths = endMonth + (13 - startMonth) + (endYear - startYear) * 12 - 12;

  timelineItems = new Array();
  for (var i=0; i < numMonths; i++) {
    var monthNumber = ((startMonth -1) + i) % 12;
    var yearNumber = startYear + Math.floor(((startMonth - 1) + i) / 12);

    timelineItem = new TimelineItem(
      getEventsInYearAndMonth(events, yearNumber, monthNumber), // events in this item
      (monthNames[monthNumber]), // title of this item
      (monthNames[monthNumber] + ' ' + yearNumber) // title of the description area
    );

    if (i == 0) {
      timelineItem.titleText = yearNumber;
    } else if (monthNumber == 0) {
      timelineItem.titleText = yearNumber;
    }

    timelineItems.push(timelineItem);
  }

  drawTimeline(timelineItems, 0, TimelineType.month);
}

// TODO: Fix... this is a bad way of doing it.
function getEventsInYearAndMonthAndDate(events, year, month, date) {
  filteredEvents = Array();

  events = getEventsInYearAndMonth(events, year, month);
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getDate() == date) {
      filteredEvents.push(events[i]);
    }
  }
  return filteredEvents;
}

function getEventsInYearAndMonth(events, year, month) {
  var filteredEvents = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getFullYear() == year &&
    events[i].start.getMonth() == month) {
      filteredEvents.push(events[i]);
    }
  }
  return filteredEvents;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

var monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var TimelineType = { month: 0, day: 1 };
var Colors = {
  arrow: {
    default: '#009900',
    onMouseDown: '#33CC66',
    unclickable: '#CEF6D8'
  },
  circle: {
    events: '#009900',
  },
  timeline: {
    line: '#ff0000',
    circle: 'red',
    expand: '#234'
  }
};
