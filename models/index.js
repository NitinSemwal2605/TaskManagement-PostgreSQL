'use strict';
import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';
import { env as _env } from 'process';
import Sequelize, { DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const basename = _basename(__filename);
const env = _env.NODE_ENV || 'development';
const configModule = await import(join(__dirname, '/../config/config.json'), { assert: { type: 'json' } });
const config = configModule.default[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(_env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(async file => {
    const modelModule = await import(join(__dirname, file));
    const model = modelModule.default(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
