// TODO: FAR TOO MANY MAGIC NUMBERS. GET RID OF THEM!
//
// Holds a list of events, index of the event being displayed and the field in
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

// Holds all current transforms.
var currentTransforms = new Array();

// Create a default timeline button.
function timelineButton(X, Y, type) {
  var button = new paper.Path.RegularPolygon(
    new paper.Point(
      X, // X position
      Y // Y position
    ),
    3, // Number of sides of polygon
    7 // Radius of polygon
  );

  // Custom properties based on type of button.
  if (type == 'next') {
    button.fillColor = Colors.arrow.default;
    button.rotate(90);
  } else {
    button.fillColor = Colors.arrow.unclickable;
    button.rotate(-90);
  }

  return button;
}

function addButtons(timeline, events, offset, i, eventTitleField) {
  var buttonNext = timelineButton(
    BUTTON_NEXT_X,
    offset + i * VERTICAL_SPACING + START_OFFSET,
    'next'
  );
  timeline.children[i].addChild(buttonNext);

  var buttonPrevious = timelineButton(
    BUTTON_PREVIOUS_X,
    offset + i * VERTICAL_SPACING + START_OFFSET,
    'previous'
  );

  timeline.children[i].addChild(buttonPrevious);

  // Make next button "unclickable" if there are no events to scroll through.
  if (events.length < 2) {
    buttonNext.fillColor = Colors.arrow.unclickable;
  }

  // Create a blob to hold this data so we can play with it.
  var displayData = new EventDisplayData(eventTitleField.events, 0, eventTitleField);
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
  buttonNext.onMouseLeave = buttonNext.onMouseUp;

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
  buttonPrevious.onMouseLeave = buttonPrevious.onMouseUp;
}

function drawEventList(timeline, events, index, VERTICAL_SPACING, offset, descriptionTitle) {
  if (events.length == 0) {
    return;
  }

  var eventTitleField = new paper.PointText(
    new paper.Point(
      TIMELINE_WIDTH / 2 + 50,
      offset + index * VERTICAL_SPACING + START_OFFSET
    )
  );

  eventTitleField.justification = 'left';
  eventTitleField.fillColor = 'black';
  eventTitleField.events = events;
  eventTitleField.content = events[0].title;
  eventTitleField.currentEvent = events[0];
  timeline.children[index].addChild(eventTitleField);

  eventTitleField.onMouseDown = function(event) {
    description = '<h2>' + this.currentEvent.eventTitleField + '</h2><p><b>Date: </b>' + this.currentEvent.start.toString() + '</p><p>'+ this.currentEvent.description + '</p>';
    $("div#description2").html(description);
  }

  // TO add or not to add...
  addButtons(timeline, events, offset, index, eventTitleField)

  // If there aren't multiple events to show.
  if (events.length == 1) {
    return;
  }

  var more = new paper.PointText(
    new paper.Point(
      eventTitleField.bounds.x + eventTitleField.bounds.width + 4,
      offset + index * VERTICAL_SPACING + START_OFFSET
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
  eventTitleField.more = more;
}

var dayTransforms = Array();

function expandDay(object) {
  // Undo all day transforms.
  for (var j = 0; j < dayTransforms.length; j++) {
    dayTransforms[j].undoTransform();
  }

  // See which(if any) day was expanded earlier.
  var previousExpanded = null;
  if (dayTransforms.length > 0) {
    previousExpanded = dayTransforms[0].object;
  }

  dayTransforms = new Array();

  translationAmount = DAY_TRANSLATION_AMOUNT; // 24 hours in a day.
  var groupToMove = object.parent;

  // If the same title is being clicked, don't redraw.
  if ((previousExpanded != null) && (groupToMove.id == previousExpanded.id)) {
    return;
  }

  // For now... dummy transform
  var properties = {
    'x':0,
    'y':0
  }
  transform = new Transform(groupToMove, undoTranslationTransform, properties);
  dayTransforms.push(transform);

  // move all other groups down.
  groupToMove = groupToMove.nextSibling;
  while (groupToMove) {
    var properties = {
      'x':0,
      'y':VERTICAL_SPACING * translationAmount
    }
    transform = new Transform(groupToMove, undoTranslationTransform, properties);
    dayTransforms.push(transform);

    groupToMove.position.y += VERTICAL_SPACING * translationAmount;
    groupToMove = groupToMove.nextSibling;
  }

  // move the months down.
  groupToMove = object.parentGroup.nextSibling;
  while (groupToMove) {
    var properties = {
      'x':0,
      'y':VERTICAL_SPACING * translationAmount
    }
    transform = new Transform(groupToMove, undoTranslationTransform, properties);
    dayTransforms.push(transform);

    groupToMove.position.y += VERTICAL_SPACING * translationAmount;
    groupToMove = groupToMove.nextSibling;
  }

  //nextOffset = (object.i + 1) * VERTICAL_SPACING;
  nextOffset = object.position.y;
  nextXOffset = 40;
  group = object.expandMethod(object.events, nextOffset, nextXOffset);
  transform = new Transform(group, undoExistenceTransform, null);
  dayTransforms.push(transform);

  // Change + to -
  object.content = '-';
  var properties = {
    'newContent':'-',
    'oldContent':'+'
  }
  var contentTransform = new Transform(object, undoContentTransform, properties);
  dayTransforms.push(contentTransform);
}

function expandMonth(object) {
  // TODO: gotta clean up... this is too messy.
  var previousGroup = null;
  if (currentTransforms.length > 0) {
    previousGroup = currentTransforms[0].object;
  }

  // Undo all current transforms.
  for (var j = 0; j < currentTransforms.length; j++) {
    currentTransforms[j].undoTransform();
  }
  for (var j = 0; j < dayTransforms.length; j++) {
    dayTransforms[j].undoTransform();
  }
  currentTransforms = new Array();
  dayTransforms = new Array();

  var month = object.events[0].start.getMonth();
  var year = object.events[0].start.getFullYear();
  translationAmount = daysInMonth(year, month);

  // handle this group appropriately since this is being expanded.
  var groupToMove = object.parent;
  var groupClicked = groupToMove;
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
      'y':VERTICAL_SPACING * translationAmount
    }
    transform = new Transform(groupToMove, undoTranslationTransform, properties);
    currentTransforms.push(transform);

    groupToMove.position.y += VERTICAL_SPACING * translationAmount;
    groupToMove = groupToMove.nextSibling;
  }

  nextOffset = object.position.y;
  nextXOffset = 20;
  group = object.expandMethod(object.events, nextOffset, groupClicked, nextXOffset);
  transform = new Transform(group, undoExistenceTransform, null);
  currentTransforms.push(transform);

  // Change + to -
  object.content = '-';
  var properties = {
    'newContent':'-',
    'oldContent':'+'
  }
  var contentTransform = new Transform(object, undoContentTransform, properties);
  currentTransforms.push(contentTransform);
}


// Draws the timeline.
function drawTimeline(timelineItems, offset, xOffset, timelineType, expandMethod, parentGroup) {
  // Length of the current timeline.
  var timelineLength = timelineItems.length * VERTICAL_SPACING;

  // Setup canvas.
  var canvas = document.getElementById("myCanvas");
  if (timelineType == TimelineType.month) {
    paper.setup(canvas);
  }

  var timeline = new paper.Group();

  // Draw scale names.
  for (var i=0; i < timelineItems.length; i++) {
    var scaleTitleField = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 30,  offset + i * VERTICAL_SPACING + START_OFFSET));

    // Group for each timeline item.
    var itemGroup = new paper.Group();
    itemGroup.addChild(scaleTitleField);
    timeline.addChild(itemGroup);

    // The large scale text displayed on the LHS of the timeline.
    var titleText = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 130,  offset + i * VERTICAL_SPACING + START_OFFSET + 5));
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

    scaleTitleField.content = timelineItems[i].title;
    scaleTitleField.style = {
      fillColor: '#444444',
      justification: 'right'
    };

    if (timelineItems[i].events.length > 0 && timelineType != TimelineType.hour) {
      var expandSign = new paper.PointText(
        new paper.Point(
          scaleTitleField.bounds.x + scaleTitleField.bounds.width + 5,
          offset + i * VERTICAL_SPACING + START_OFFSET
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
      expandSign.expandMethod = expandMethod;
      expandSign.timelineType = timelineType;
      expandSign.parentGroup = parentGroup;
      itemGroup.addChild(expandSign);

      expandSign.onMouseEnter = function(event) {
        this.font = 'helvetica-bold';
      };

      expandSign.onMouseLeave = function(event) {
        this.font = 'helvetica';
      };

      expandSign.onMouseDown = function(event) {
        if (this.timelineType == TimelineType.month) {
          expandMonth(this);
        } else if (this.timelineType == TimelineType.day) {
          expandDay(this);
        }
      }
    }


    var path = new paper.Path();
    var start = new paper.Point(TIMELINE_WIDTH / 2,  offset + START_OFFSET / 2 + i * VERTICAL_SPACING);
    path.moveTo(start);
    path.lineTo(
      start.add(
        [ 0, START_OFFSET]
      )
    );
    path.strokeColor = Colors.timeline.line;
    path.strokeWidth = 2;
    path.strokeCap = 'round';

    var circle = new paper.Path.Circle(
      new paper.Point(
        TIMELINE_WIDTH / 2,
        offset + i * VERTICAL_SPACING + START_OFFSET
      ),
      5 // radius
    );
    circle.fillColor = Colors.timeline.circle;

    itemGroup.addChild(path);
    itemGroup.addChild(circle);

    drawEventList(timeline, timelineItems[i].events, i, VERTICAL_SPACING, offset, timelineItems[i].descriptionTitle);
  }

  // Adjust canvas to appropriate size.
  if (timelineType == TimelineType.day || timelineType == TimelineType.hour) {
    canvas.height += timelineLength;
    paper.view.viewSize.height += canvas.height;

    // Create transforms - so we can undo them later.
    var properties = {
      'width': 0,
      'height': timelineLength
    }
    canvasTransform = new Transform(canvas, undoSizeTransform, properties);
    viewTransform = new Transform(paper.view.viewSize, undoSizeTransform, properties);

    if (timelineType == TimelineType.day) {
      currentTransforms.push(canvasTransform);
      currentTransforms.push(viewTransform);
    } else {
      dayTransforms.push(canvasTransform);
      dayTransforms.push(viewTransform);
    }
  } else {
    canvas.height = timelineLength + START_OFFSET + END_OFFSET;
    paper.view.viewSize.height = canvas.height;
  }

  return timeline;

  // TODO: Figure out what this does.
//  paper.view.draw();
}

// TODO
function drawTimelineWithHourGranularity(sortedEvents, offset, xOffset) {
  events = sortedEvents;
  numHours = 24;
  timelineItems = new Array();
  for (var i=0; i < numHours; i++) {
    filteredEvents = getEventsInTime(
      events,
      events[0].start.getFullYear(),
      events[0].start.getMonth(),
      events[0].start.getDate(),
      i // hour
    );

    itemTitle = i + ":00";
    var descriptionTitle = createDescriptionTitle(
      events[0].start.getFullYear(),
      events[0].start.getMonth(),
      events[0].start.getDate(),
      i
    );

    timelineItem = new TimelineItem(
      filteredEvents,
      itemTitle,
      descriptionTitle
    );
    timelineItems.push(timelineItem);
  }

  return drawTimeline(timelineItems, offset, xOffset, TimelineType.hour);
}

// NOTE: For now, the events must be of the same month.
// parentGroup - month group this belongs to.
function drawTimelineWithDayGranularity(sortedEvents, offset, parentGroup, xOffset) {
  events = sortedEvents;
  numDays = daysInMonth(
    sortedEvents[0].start.getFullYear(),
    sortedEvents[0].start.getMonth()
  );

  timelineItems = new Array();
  for (var i=0; i < numDays; i++) {
    filteredEvents = getEventsInTime(
      sortedEvents,
      sortedEvents[0].start.getFullYear(),
      sortedEvents[0].start.getMonth(),
      i + 1 // date index is from 1 - 31
    );

    itemTitle = (i + 1); // title is just the day number
    var descriptionTitle = createDescriptionTitle(
      sortedEvents[0].start.getFullYear(),
      sortedEvents[0].start.getMonth(),
      (i + 1)
    );

    timelineItem = new TimelineItem(
      filteredEvents,
      itemTitle,
      descriptionTitle
    );
    timelineItems.push(timelineItem);
  }

  return drawTimeline(timelineItems, offset, xOffset, TimelineType.day, drawTimelineWithHourGranularity, parentGroup);
}

function drawTimelineWithMonthGranularity(sortedEvents, offset, xOffset) {
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

    var descriptionTitle = createDescriptionTitle(yearNumber, monthNumber);
    timelineItem = new TimelineItem(
      getEventsInTime(events, yearNumber, monthNumber), // events in this item
      (monthNames[monthNumber]), // title of this item
      descriptionTitle // title of the description area
    );

    if (i == 0) {
      timelineItem.titleText = yearNumber;
    } else if (monthNumber == 0) {
      timelineItem.titleText = yearNumber;
    }

    timelineItems.push(timelineItem);
  }

  drawTimeline(
    timelineItems,
    offset, // offset is 0... since this is the default version.
    xOffset,
    TimelineType.month,
    drawTimelineWithDayGranularity
  );
}

// Creates a title for the event description box.
function createDescriptionTitle(year, month, day, hour) {
  var title = '';
  if (year != undefined) {
    title = year + title;
  }
  if (month != undefined) {
    title = monthNames[month] + ' ' + title;
  }
  if (day != undefined) {
    title = day + ' ' + title;
  }
  if (hour != undefined) {
    title = title + " at " + hour;
  }
  return title;
}

function getEventsInTime(events, year, month, date, hour) {
  var filteredEvents = Array();
  if (year != undefined) {
    filteredEvents = getEventsInYear(events, year);
  }
  if (month != undefined) {
    filteredEvents = getEventsInMonth(filteredEvents, month);
  }
  if (date != undefined) {
    filteredEvents = getEventsOnDate(filteredEvents, date);
  }
  if (hour != undefined) {
    filteredEvents = getEventsOnHour(filteredEvents, hour);
  }
  return filteredEvents;
}

function getEventsOnHour(events, hour) {
  var filteredEvents = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getHours() == hour)
      filteredEvents.push(events[i]);
  }
  return filteredEvents;
}

function getEventsOnDate(events, date) {
  var filteredEvents = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getDate() == date)
      filteredEvents.push(events[i]);
  }
  return filteredEvents;
}

function getEventsInMonth(events, month) {
  var filteredEvents = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getMonth() == month)
      filteredEvents.push(events[i]);
  }
  return filteredEvents;
}

function getEventsInYear(events, year) {
  var filteredEvents = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getFullYear() == year)
      filteredEvents.push(events[i]);
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

var TimelineType = { month: 0, day: 1, hour:2 };
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
