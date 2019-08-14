const LoopbackAdapter = function () {};

LoopbackAdapter.prototype.build = function(Model, attributes) {
  return attributes;
};

LoopbackAdapter.prototype.get = function(doc, attr, Model) {
  return doc[attr];
};

LoopbackAdapter.prototype.set = function(props, doc, Model) {
  return doc.set(props);
};

LoopbackAdapter.prototype.save = function(doc, Model, callback) {
  return Model.create(doc, callback);
};

LoopbackAdapter.prototype.create = function(doc, Model, callback) {
  return Model.create(doc, callback);
};

LoopbackAdapter.prototype.destroy = function(doc, Model, callback) {
  return Model.destroyById(doc.id, callback);
};

module.exports = LoopbackAdapter;
