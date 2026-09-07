const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

function mapCreate(data = {}) {
  const mapped = { ...data };
  if (mapped._id && !mapped.id) mapped.id = mapped._id;
  delete mapped._id;
  return mapped;
}

function translateFilter(filter = {}) {
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    return undefined;
  }

  const where = {};

  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue;

    if (key === '$or') {
      where[Op.or] = value.map((item) => translateFilter(item) || {});
      continue;
    }

    const column = key === '_id' ? 'id' : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (value.$regex !== undefined) {
        const pattern = value.$regex instanceof RegExp ? value.$regex.source : String(value.$regex);
        where[column] = { [Op.iLike]: `%${pattern}%` };
        continue;
      }
    }

    where[column] = value;
  }

  return Object.keys(where).length ? where : undefined;
}

function jsonWithId(instance, options = {}) {
  const values = instance.toJSON ? instance.toJSON() : { ...instance };
  values._id = values.id;
  if (options.hidePassword && options.includePassword !== true) {
    delete values.password;
  }
  return values;
}

function wrapInstance(instance, options = {}) {
  if (!instance) return null;
  if (instance.__isCompatWrapped) return instance;
  instance.__isCompatWrapped = true;

  const originalToJSON = instance.toJSON.bind(instance);
  instance.toJSON = function toJSON() {
    const values = originalToJSON();
    values._id = values.id;
    if (options.hidePassword && options.includePassword !== true) {
      delete values.password;
    }
    return values;
  };

  return new Proxy(instance, {
    get(target, prop) {
      if (prop === '_id') return target.id;
      if (prop === 'toObject') {
        return () => jsonWithId(target, options);
      }
      if (prop === 'save') {
        return async () => {
          await target.save();
          return wrapInstance(target, options);
        };
      }
      if (prop === 'matchPassword') {
        return async (enteredPassword) => bcrypt.compare(enteredPassword, target.password || '');
      }
      const value = target[prop];
      if (typeof value === 'function') return value.bind(target);
      return value;
    },
    set(target, prop, value) {
      if (prop === '_id') {
        target.id = value;
        return true;
      }
      target[prop] = value;
      return true;
    },
  });
}

class Query {
  constructor(model, filter = {}, options = {}, extra = {}) {
    this.model = model;
    this.filter = filter;
    this.options = options;
    this.single = extra.single === true;
    this.order = undefined;
    this.offset = undefined;
    this.limitVal = undefined;
    this.attributes = undefined;
    this.includePassword = extra.includePassword === true;
  }

  sort(spec = {}) {
    this.order = Object.entries(spec).map(([field, dir]) => [field, dir === 1 || dir === 'asc' ? 'ASC' : 'DESC']);
    return this;
  }

  skip(count) {
    this.offset = Number(count) || 0;
    return this;
  }

  limit(count) {
    this.limitVal = Number(count);
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      const tokens = fields.trim().split(/\s+/);
      if (tokens.includes('+password')) {
        this.includePassword = true;
      } else if (tokens.includes('-password')) {
        this.includePassword = false;
      } else {
        this.attributes = tokens.filter((token) => !token.startsWith('+') && !token.startsWith('-'));
      }
    }
    return this;
  }

  async exec() {
    const where = translateFilter(this.filter);
    const query = { where };

    if (this.order) query.order = this.order;
    if (this.offset !== undefined) query.offset = this.offset;
    if (this.limitVal !== undefined) query.limit = this.limitVal;

    if (this.attributes) {
      query.attributes = this.attributes.includes('id') ? this.attributes : ['id', ...this.attributes];
    } else if (this.options.hidePassword && this.includePassword !== true) {
      query.attributes = { exclude: ['password'] };
    }

    if (this.single) {
      const id = this.filter.id || this.filter._id;
      if (id && !isUuid(String(id))) return null;
      const row = await this.model.findOne(query);
      return wrapInstance(row, { ...this.options, includePassword: this.includePassword });
    }

    const rows = await this.model.findAll(query);
    return rows.map((row) => wrapInstance(row, { ...this.options, includePassword: this.includePassword }));
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.exec().catch(onRejected);
  }
}

function wrapModel(SequelizeModel, options = {}) {
  function Model(data) {
    return wrapInstance(SequelizeModel.build(mapCreate(data)), options);
  }

  Model.find = (filter = {}) => new Query(SequelizeModel, filter, options);
  Model.findOne = (filter = {}) => new Query(SequelizeModel, filter, options, { single: true });
  Model.findById = (id) => new Query(SequelizeModel, { id }, options, { single: true });

  Model.create = async (data) => {
    const row = await SequelizeModel.create(mapCreate(data));
    return wrapInstance(row, options);
  };

  Model.insertMany = async (docs = []) => {
    const rows = await SequelizeModel.bulkCreate(docs.map(mapCreate));
    return rows.map((row) => wrapInstance(row, options));
  };

  Model.countDocuments = async (filter = {}) => {
    return SequelizeModel.count({ where: translateFilter(filter) });
  };

  Model.deleteMany = async (filter = {}) => {
    return SequelizeModel.destroy({ where: translateFilter(filter) });
  };

  Model.findByIdAndUpdate = async (id, update = {}, extra = {}) => {
    if (!isUuid(String(id))) return null;
    const row = await SequelizeModel.findByPk(id);
    if (!row) return null;

    const payload = { ...update };
    if (payload.$inc) {
      for (const [field, amount] of Object.entries(payload.$inc)) {
        row[field] = (row[field] || 0) + amount;
      }
      delete payload.$inc;
    }
    delete payload._id;
    delete payload.id;

    Object.assign(row, payload);
    await row.save();
    return extra.new === false ? row : wrapInstance(row, options);
  };

  Model.findByIdAndDelete = async (id) => {
    if (!isUuid(String(id))) return null;
    const row = await SequelizeModel.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return wrapInstance(row, options);
  };

  if (options.statics) {
    Object.assign(Model, options.statics);
  }

  Model.sequelizeModel = SequelizeModel;
  return Model;
}

module.exports = {
  wrapModel,
  wrapInstance,
  isUuid,
};
