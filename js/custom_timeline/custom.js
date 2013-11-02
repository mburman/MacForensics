// TODO: FAR TOO MANY MAGIC NUMBERS. GET RID OF THEM!
//
// Holds a list of eventsm index of the event being displayed and the field in
// which it is displayed.
function EventDisplayData(events, eventDisplayedIndex, textField) {
  this.events = events;
  this.eventDisplayedIndex = eventDisplayedIndex;
  this.textField = textField;
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
    
      var title = new paper.PointText(new paper.Point(timeline_width / 2 + 50, i * itemPixels + start_offset));
      title.justification = 'left';
      title.fillColor = 'black';
      title.events = text.events;

      if (text.events.length > 0) {
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

      var buttonNext = new paper.Path.RegularPolygon(new paper.Point(timeline_width / 2 + 35, i * itemPixels + start_offset), 3, 7);
      buttonNext.fillColor = '#009900';
      buttonNext.rotate(90);

      var buttonPrevious = new paper.Path.RegularPolygon(new paper.Point(timeline_width / 2 + 20, i * itemPixels + start_offset), 3, 7);
      buttonPrevious.fillColor = '#009900';
      buttonPrevious.rotate(-90);

      // Create a blob to hold this data so we can play with it.
      var displayData = new EventDisplayData(text.events, 0, title);
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

      if (text.events.length > 0) {
        title.content = title.events[0].title;
      }

    }

/*
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
*/
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
