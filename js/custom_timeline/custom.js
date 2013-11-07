// Offset from the top of the canvas to the first item in the timeline.
var START_OFFSET = 50;

// Offset from the bottom of the canvas to the last item in the timeline.
var END_OFFSET = 50;

// Width of the timeline.
var TIMELINE_WIDTH = 1200;

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

function TimelineItem(events, title) {
  this.events = events;
  this.title = title;
}

// TODO: Rewrite these to one transform function... very bad style right now.
// Indicates how a group was transformed(in this case in the x and y direction)
function Transform(object, x, y, undoTransform) {
  this.object = object;
  this.x = x;
  this.y = y;
  this.undoTransform = undoTransform;
}

function SizeTransform(object, width, height, undoTransform) {
  this.object = object;
  this.width = width;
  this.height = height;
  this.undoTransform = undoTransform;
}

// Undoes translation along x and y.
function undoTranslationTransform() {
  this.object.position.x -= this.x;
  this.object.position.y -= this.y;
}

function undoExistenceTransform() {
  this.object.remove();
}

function undoSizeTransform() {
  this.object.height -= this.height;
  this.object.width -= this.width;
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
  buttonPrevious.fillColor = Colors.arrow.default;
  buttonPrevious.rotate(-90);
  timeline.addChild(buttonPrevious);
  timeline.children[i].addChild(buttonPrevious);

  // Make buttons "unclickable" if there are no events to scroll through.
  if (events.length < 2) {
    buttonNext.fillColor = Colors.arrow.unclickable;
    buttonPrevious.fillColor = Colors.arrow.unclickable;
  }

  // Create a blob to hold this data so we can play with it.
  var displayData = new EventDisplayData(title.events, 0, title);
  buttonNext.data = displayData;
  buttonPrevious.data = displayData;

  buttonNext.onMouseDown = function(event) {
    if (this.data.events.length < 2) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }

    this.fillColor = Colors.arrow.onMouseDown;
    // Display the next event.
    this.data.eventDisplayedIndex++;
    this.data.eventDisplayedIndex %= this.data.events.length;
    this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
    this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    if (this.data.events.length > 1) {
      this.data.textField.more.bounds.x = this.data.textField.bounds.x + this.data.textField.bounds.width + 3;
    }
  }

  buttonNext.onMouseUp = function(event) {
    if (this.data.events.length < 2) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }

    this.fillColor = Colors.arrow.default;
  }
  buttonNext.onMouseLeave = buttonNext.onMouseUp;

  buttonPrevious.onMouseDown = function(event) {
    if (this.data.events.length < 2) {
      this.fillColor = Colors.arrow.unclickable;
      return;
    }

    this.fillColor = Colors.arrow.onMouseDown;

    // Display the previous event.
    this.data.eventDisplayedIndex--;
    this.data.eventDisplayedIndex %= this.data.events.length;

    // Index can become negative when scrolling backwards. If so, reset index.
    if (this.data.eventDisplayedIndex < 0) {
      this.data.eventDisplayedIndex = this.data.events.length - 1;
    }
    this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
    this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    if (this.data.events.length > 1) {
      this.data.textField.more.bounds.x = this.data.textField.bounds.x + this.data.textField.bounds.width + 3;
    }

  }

  buttonPrevious.onMouseUp = buttonNext.onMouseLeave;
  buttonPrevious.onMouseLeave = buttonNext.onMouseLeave;
}

function drawEventList(timeline, events, index, SCALE_SPACING, offset) {
  if (events.length < 1) {
    return;
  }

  var width = TIMELINE_WIDTH / 2 + 50;
  var title = new paper.PointText(
    new paper.Point(
      width,
      offset + index * SCALE_SPACING + START_OFFSET
    )
  );

  title.justification = 'left';
  title.fillColor = 'black';
  title.events = events;
  timeline.children[index].addChild(title);

  title.content = events[0].title;
  title.currentEvent = events[0];

  title.justification = 'left';

  title.onMouseDown = function(event) {
    var NewDialog = $('<div id="Description">\<p>' + this.currentEvent.description + '</p>\</div>');
    var position = [ 'center', 200];

    NewDialog.dialog({
      modal: true,
      show: 'fade',
      hide: 'fade',
      closeOnEscape: true,
      position: position,
      title: this.currentEvent.title,
    });
  }

  width = title.bounds.x + title.bounds.width + 1;

  if (events.length > 1) {
    var more = new paper.PointText(
      new paper.Point(
        width + 3,
        offset + index * SCALE_SPACING + START_OFFSET
      )
    );

    more.justification = 'left';
    more.fillColor = 'green';
    more.events = events;
    timeline.children[index].addChild(title);
    more.content = '(...)';
    more.font = 'helvetica'

    more.onMouseEnter = function(event) {
      this.font = 'helvetica-bold'
    }

    more.onMouseLeave = function(event) {
      this.font = 'helvetica'
    }


    timeline.children[index].addChild(more);
    title.more = more;
  }

  // TO add or not to add...
  addButtons(timeline, events, offset, index, title)

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
    var text = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 20,  offset + i * SCALE_SPACING + START_OFFSET));
    text.content = timelineItems[i].title;
    text.events = timelineItems[i].events;
    text.i = i;

    text.style = {
      fillColor: 'black',
      justification: 'right'
    };

    text.onMouseEnter = function(event) {
      this.fillColor = 'red';
      this.fontSize = 13;
    }

    text.onMouseLeave = function(event) {
      this.fillColor = 'black';
      this.fontSize = 12;
    }

    text.onMouseDown = function(event) {
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
      transform = new Transform(groupToMove, 0, 0, undoTranslationTransform);
      currentTransforms.push(transform);

      // move all other groups down.
      groupToMove = groupToMove.nextSibling;
      while (groupToMove) {
        transform = new Transform(groupToMove, 0, SCALE_SPACING * translationAmount, undoTranslationTransform);
        currentTransforms.push(transform);

        groupToMove.position.y += SCALE_SPACING * translationAmount;
        groupToMove = groupToMove.nextSibling;
      }

      nextOffset = (this.i + 1) * SCALE_SPACING;

      // TODO: Need to fix. Pass in a function and call that instead.
      group = drawTimelineWithDayGranularity(this.events, nextOffset);
      transform = new Transform(group, 0, 0, undoExistenceTransform);
      currentTransforms.push(transform);
    }

    // Group for each timeline item.
    var itemGroup = new paper.Group();
    itemGroup.addChild(text);
    timeline.addChild(itemGroup);

    var path = new paper.Path();
    var start = new paper.Point(TIMELINE_WIDTH / 2,  offset + START_OFFSET / 2 + i * SCALE_SPACING);
    path.moveTo(start);
    path.lineTo(
      start.add(
        [ 0, START_OFFSET]
      )
    );
    path.strokeColor = Colors.timeline.line;
    path.strokeWidth = 10;
    path.strokeCap = 'round';

    var circle = new paper.Path.Circle(new paper.Point(TIMELINE_WIDTH / 2,  offset + i * SCALE_SPACING + START_OFFSET), 2);
    circle.fillColor = Colors.timeline.circle;

    timeline.children[i].addChild(path);
    timeline.children[i].addChild(circle);


    drawEventList(timeline, timelineItems[i].events, i, SCALE_SPACING, offset);
    //drawEventDots(text.events, i, SCALE_SPACING);
  }

  // Adjust canvas to appropriate size.
  if (timelineType == TimelineType.day) {
    canvas.height += timelineLength;
    paper.view.viewSize.height += canvas.height;

    // Create transforms - so we can undo them later.
    canvasTransform = new SizeTransform(canvas, 0, timelineLength, undoSizeTransform);
    viewTransform = new SizeTransform(paper.view.viewSize, 0, timelineLength, undoSizeTransform);
    currentTransforms.push(canvasTransform);
    currentTransforms.push(viewTransform);
  } else {
    canvas.height = timelineLength + START_OFFSET + END_OFFSET;
    paper.view.viewSize.height = canvas.height;
  }

  canvas.width = TIMELINE_WIDTH;
  paper.view.viewSize.width = canvas.width;


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
      itemTitle
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
      (monthNames[monthNumber] + ' ' + yearNumber) // title of this item
    );
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
    circle: 'white'
  }
};
