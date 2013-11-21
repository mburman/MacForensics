// Indicates how an object was transformed.
// undoTransform is a function to undo the transform.
// properties holds the transformation values.
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
