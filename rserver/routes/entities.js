const express = require('express');
const router = express.Router();

const Joi = require('joi');

const fs = require('fs');
const { mkdir,writeFile } = require("fs/promises");
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

const sqlite3 = require('sqlite3');
const util = require('util');

const DOWNLOADS_FOLDER = './downloads';

// download file from 'url' if the file does not already exist
const downloadFileIfNeeded = (async (url, folder=".") => {
  if (!fs.existsSync(DOWNLOADS_FOLDER)) {
    await mkdir(DOWNLOADS_FOLDER);
  }
  const destination = path.resolve(DOWNLOADS_FOLDER, folder);
  if (!fs.existsSync(destination)) {
    // fetch and stream output to file
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(destination, { flags: 'w' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
  }
});

// /entities
// Standard REST route
// used an 'id' filter (required)
// example: /entities?id=7600&id=8100
//
// Specification implied a route that accepts one entity id
// and multiple. This route accepts one or multiple.
router.get('/', async function(req, res, next) {
  // validate entity IDs
  const entityIds = Joi.attempt(req.query, Joi.object({ id: Joi.array().items(Joi.number()).single().required() }))?.id;
  // URI should be moved to env var
  // download path should be made unique if more URIs are supported
  await downloadFileIfNeeded('https://resolve-dev-public.s3.amazonaws.com/sample-data/interview/props.db', 'props.db');
  const destination = path.resolve(DOWNLOADS_FOLDER, 'props.db');
  let db = new sqlite3.Database(destination, sqlite3.OPEN_READWRITE);
  db.all = util.promisify(db.all);
  // TODO handle entities not found
  const properties = await db.all(`select entity_id, category, name, display_name, value from _objects_eav
join _objects_attr on _objects_attr.id = _objects_eav.attribute_id
join _objects_val on _objects_val.id = _objects_eav.value_id
where entity_id in (${entityIds.map(() => '?').join(',')});`, entityIds);
  const resEntities = {};
  // group properties by category
  properties.forEach(({ entity_id, name, display_name, category, value }) => {
    // create new entity if needed
    if (!resEntities[entity_id]) {
      resEntities[entity_id] = { entityId: entity_id, properties: {} };
    }
    // handle 'name' specially to be at top-level for entity
    if (name === 'name') {
      resEntities[entity_id]['name'] = value;
    } else if (!category.startsWith('__')) { // categories that start with __ are not user facing
      if (!resEntities[entity_id]['properties'][category]) {
        resEntities[entity_id]['properties'][category] = {};
      }
      resEntities[entity_id]['properties'][category][display_name || name] = value;
    }
  });
  res.json({ entities: Object.values(resEntities) });
});

module.exports = router;

