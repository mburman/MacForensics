// A timeline event.
function Event(title, description, start) {
  this.title = title;
  this.description = description;
  this.start = new Date(start);
}

function drawTimelineWithMonthGranularity(events) {
  var startYear = events[0].start.getFullYear();
  var endYear = events[events.length - 1].start.getFullYear();
  // From 1 - 12.
  var startMonth = events[0].start.getMonth() + 1;
  var endMonth = events[events.length - 1].start.getMonth() + 1;
  var numMonths = endMonth + (13 - startMonth) + (endYear - startYear) * 12 - 12;
  console.log(numMonths);

  // Give each month n pixels.
  var itemPixels = 40;

  // Offset from the top of the canvas to the first item in the timeline.
  var start_offset = 50;
  // Offset from the bottom of the canvas to the last item in the timeline.
  var end_offset = 50;
  var timeline_length = itemPixels * numMonths;
  var timeline_width = 1200;

  // Adjust canvas to appropriate size.
  var canvas = document.getElementById("myCanvas");
  canvas.height = timeline_length + start_offset + end_offset;
  canvas.width = timeline_width;

  paper.setup(canvas);
  var path = new paper.Path();
  var start = new paper.Point(timeline_width / 2, start_offset / 2);
  path.moveTo(start);
  path.lineTo(start.add([ 0, timeline_length - itemPixels + start_offset
    / 2 + end_offset / 2]));
    path.strokeColor = '#ff0000';
    path.strokeWidth = 10;
    path.strokeCap = 'round';

    // Draw month names.
    for (var i=0; i < numMonths; i++) {
      var monthNumber = ((startMonth -1) + i) % 12;
      var yearNumber = startYear + Math.floor(((startMonth - 1) + i) / 12);

      var text = new paper.PointText(new paper.Point(timeline_width / 2 - 20, i * itemPixels + start_offset));
      text.justification = 'right';
      text.fillColor = 'black';
      text.content = monthNames[monthNumber] + " " + yearNumber;
      text.events = getEventsInYearAndMonth(events, yearNumber, monthNumber);

      text.onMouseDown = function(event) {
        // TODO: Display text.events in a nice popup.. or something.
      }

      var circle = new paper.Path.Circle(new paper.Point(timeline_width / 2, i * itemPixels + start_offset), 2);
      circle.fillColor = 'white';
    }

    for (var i = 0; i < events.length; i++) {
      // Need to figure out which month it falls in.
      eventMonth = events[i].start.getMonth() + 1;
      eventYear = events[i].start.getFullYear();
      index = eventMonth + (13 - startMonth) + (eventYear - startYear) * 12 - 12;
      // Since index starts from 0.
      index--;

      var title = new paper.PointText(new paper.Point(timeline_width / 2 + 20, index * itemPixels + start_offset));
      title.justification = 'left';
      title.fillColor = 'black';
      title.content = events[i].title;

      var myCircle = new paper.Path.Circle(new paper.Point(timeline_width / 2, index * itemPixels + start_offset), 7);
      myCircle.fillColor = 'white';
      myCircle.strokeColor = '#ff0000';
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

var monthNames = [ 
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" 
];

// Given a day and year, return a date object.
function dayAndYearToDate(day, year) {
}

// Returns a day from 0 - 366.
function getDayInYear(date) {
}

// Returns total number of days in a year.
function getDaysInYear(year) {
}
