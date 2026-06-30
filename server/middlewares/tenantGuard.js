export const tenantGuard = (model) => {
  return async (req, res, next) => {
    const originalQuery = model.find;
    model.find = function (filter, ...args) {
      if (filter && filter.tenantId) return originalQuery.call(this, filter, ...args);
      if (filter && filter._id) return originalQuery.call(this, { ...filter, tenantId: req.tenantId }, ...args);
      return originalQuery.call(this, { ...filter, tenantId: req.tenantId }, ...args);
    };

    const originalCount = model.countDocuments;
    model.countDocuments = function (filter = {}, ...args) {
      return originalCount.call(this, { ...filter, tenantId: req.tenantId }, ...args);
    };

    const originalFindOne = model.findOne;
    model.findOne = function (filter = {}, ...args) {
      return originalFindOne.call(this, { ...filter, tenantId: req.tenantId }, ...args);
    };

    const originalFindById = model.findById;
    model.findById = function (id, ...args) {
      return originalFindOne.call(this, { _id: id, tenantId: req.tenantId }, ...args);
    };

    const originalFindOneAndUpdate = model.findOneAndUpdate;
    model.findOneAndUpdate = function (filter = {}, update, ...args) {
      return originalFindOneAndUpdate.call(this, { ...filter, tenantId: req.tenantId }, update, ...args);
    };

    const originalFindByIdAndUpdate = model.findByIdAndUpdate;
    model.findByIdAndUpdate = function (id, update, ...args) {
      return originalFindOneAndUpdate.call(this, { _id: id, tenantId: req.tenantId }, update, ...args);
    };

    const originalFindByIdAndDelete = model.findByIdAndDelete;
    model.findByIdAndDelete = function (id, ...args) {
      return originalFindOneAndUpdate.call(this, { _id: id, tenantId: req.tenantId }, { isActive: false }, ...args);
    };

    const originalDeleteOne = model.deleteOne;
    model.deleteOne = function (filter = {}, ...args) {
      return originalFindOneAndUpdate.call(this, { ...filter, tenantId: req.tenantId }, { isActive: false }, ...args);
    };

    next();
  };
};
