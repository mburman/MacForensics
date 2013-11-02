// Offset from the top of the canvas to the first item in the timeline.
var START_OFFSET = 50;

// Offset from the bottom of the canvas to the last item in the timeline.
var END_OFFSET = 50;

// Width of the timeline.
var TIMELINE_WIDTH = 1200;

var EVENTS_OFFSET = 30;
// TODO: FAR TOO MANY MAGIC NUMBERS. GET RID OF THEM!
//
// Holds a list of eventsm index of the event being displayed and the field in
// which it is displayed.
function EventDisplayData(events, eventDisplayedIndex, textField) {
  this.events = events;
  this.eventDisplayedIndex = eventDisplayedIndex;
  this.textField = textField;
}

// Display events as dots instead of in a text field.
function drawEventDots(events, index, scaleSpacing) {
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
      (index + offset) * scaleSpacing + START_OFFSET
    );

    var circle = new paper.Path.Circle(point, 3);
    circle.fillColor = '#009900';
  }
}

function drawEventList(events, i, scaleSpacing) {
  var title = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 + 50, i * scaleSpacing + START_OFFSET));
  title.justification = 'left';
  title.fillColor = 'black';
  title.events = events;

  if (title.events.length > 0) {
    title.content = title.events[0].title;
    title.currentEvent = title.events[0];

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
  }

  var buttonNext = new paper.Path.RegularPolygon(new paper.Point(TIMELINE_WIDTH / 2 + 35, i * scaleSpacing + START_OFFSET), 3, 7);
  buttonNext.fillColor = '#009900';
  buttonNext.rotate(90);

  var buttonPrevious = new paper.Path.RegularPolygon(new paper.Point(TIMELINE_WIDTH / 2 + 20, i * scaleSpacing + START_OFFSET), 3, 7);
  buttonPrevious.fillColor = '#009900';
  buttonPrevious.rotate(-90);

  // Create a blob to hold this data so we can play with it.
  var displayData = new EventDisplayData(title.events, 0, title);
  buttonNext.data = displayData;
  buttonPrevious.data = displayData;

  buttonNext.onMouseDown = function(event) {
    this.fillColor = '#33CC66';

    if (this.data.events.length > 1) {
      // Display the next event.
      this.data.eventDisplayedIndex++;
      this.data.eventDisplayedIndex %= this.data.events.length;
      this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
      this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    }
  }

  buttonNext.onMouseUp = function(event) {
    this.fillColor = '#009900';
  }

  buttonNext.onMouseLeave = function(event) {
    this.fillColor = '#009900';
  }


  buttonPrevious.onMouseDown = function(event) {
    this.fillColor = '#33CC66';

    if (this.data.events.length > 1) {
      // Display the previous event.
      this.data.eventDisplayedIndex--;
      this.data.eventDisplayedIndex %= this.data.events.length;

      // Index can become negative when scrolling backwards. If so, reset index. 
      if (this.data.eventDisplayedIndex < 0) {
        this.data.eventDisplayedIndex = this.data.events.length - 1;
      }
      this.data.textField.content = this.data.events[this.data.eventDisplayedIndex].title;
      this.data.textField.currentEvent = this.data.events[this.data.eventDisplayedIndex];
    }
  }

  buttonPrevious.onMouseUp = function(event) {
    this.fillColor = '#009900';
  }

  buttonPrevious.onMouseLeave = function(event) {
    this.fillColor = '#009900';
  }

  if (title.events.length > 0) {
    title.content = title.events[0].title;
  }
}

// Draws the timeline.
function drawTimelineWithMonthGranularity(sorted_events) {
  events = sorted_events;
  var startYear = events[0].start.getFullYear();
  var endYear = events[events.length - 1].start.getFullYear();

  // Add 1 to change the index from 1 - 12.
  var startMonth = events[0].start.getMonth() + 1;
  var endMonth = events[events.length - 1].start.getMonth() + 1;
  var numMonths = endMonth + (13 - startMonth) + (endYear - startYear) * 12 - 12;
  console.log(numMonths);

  // Give each month n pixels.
  var scaleSpacing = 40;

  var timeline_length = scaleSpacing * numMonths;

  // Adjust canvas to appropriate size.
  var canvas = document.getElementById("myCanvas");
  canvas.height = timeline_length + START_OFFSET + END_OFFSET;
  canvas.width = TIMELINE_WIDTH;

  paper.setup(canvas);
  var path = new paper.Path();
  var start = new paper.Point(TIMELINE_WIDTH / 2, START_OFFSET / 2);
  path.moveTo(start);
  path.lineTo(start.add([ 0, timeline_length - scaleSpacing + START_OFFSET
    / 2 + END_OFFSET / 2]));
    path.strokeColor = '#ff0000';
    path.strokeWidth = 10;
    path.strokeCap = 'round';

    // Draw month names.
    for (var i=0; i < numMonths; i++) {
      var monthNumber = ((startMonth -1) + i) % 12;
      var yearNumber = startYear + Math.floor(((startMonth - 1) + i) / 12);

      var text = new paper.PointText(new paper.Point(TIMELINE_WIDTH / 2 - 20, i * scaleSpacing + START_OFFSET));
      text.justification = 'right';
      text.fillColor = 'black';
      text.content = monthNames[monthNumber] + " " + yearNumber;
      text.events = getEventsInYearAndMonth(events, yearNumber, monthNumber);

      text.onMouseDown = function(event) {
        // TODO: Display text.events in a nice popup.. or something.
      }

      var circle = new paper.Path.Circle(new paper.Point(TIMELINE_WIDTH / 2, i * scaleSpacing + START_OFFSET), 2);
      circle.fillColor = 'white';
    
      // drawEventList(text.events, i, scaleSpacing);
      drawEventDots(text.events, i, scaleSpacing);
    }
    
    paper.view.draw();
}

function getEventsInYearAndMonth(events, year, month) {
  var toReturn = Array();
  for (var i = 0; i < events.length; i++) {
    if (events[i].start.getFullYear() == year &&
    events[i].start.getMonth() == month) {
      toReturn.push(events[i]);
    }
  }
  return toReturn;
}

function daysInMonth(month,year) {
  return new Date(year, month + 1, 0).getDate();
}

var monthNames = [ 
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" 
];
