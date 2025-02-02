const express = require('express');
const router = express.Router();

const listSchema = require('../../../models/lists');
const { getClient } = require('../../../util/database/dragonfly');

router.get('/', async (req, res) => {
    let cacheClient = getClient();

    let ozLogin = await cacheClient.hget('oz:data', 'login');
    
    let ozList = await listSchema.findOne({ name: ozLogin });

    res.send(ozList.list);
});

router.post('/', async (req, res) => {
    let cacheClient = getClient();

    let body = req.body;

    let userName = body.name;
    userName = userName.toLowerCase();

    let ozLogin = await cacheClient.hget('oz:data', 'login');
    
    let exists = await cacheClient.sismember('oz:list', userName);

    if(exists) {
        return res.status(409).json({error: 'User already exists in list', message: 'User already exists in list', status: 409});
    }

    let ozList = await listSchema.findOne({ name: ozLogin });

    ozList.list.push(userName);

    cacheClient.sadd('oz:list', userName);

    await ozList.save();

    return res.status(200).json({message: 'User added', status: 200});
    
});

router.delete('/', async (req, res) => {
    let cacheClient = getClient();

    let body = req.body;

    let userName = body.name;
    userName = userName.toLowerCase();
    
    let ozLogin = await cacheClient.hget('oz:data', 'login');

    let exists = await cacheClient.sismember('oz:list', userName);

    if(!exists) {
        return res.status(404).json({error: 'List not found', message: 'User does not exists in list', status: 404});
    }
    
    let ozList = await listSchema.findOne({ name: ozLogin });

    ozList.list = ozList.list.filter(list => list !== userName);

    cacheClient.srem('oz:list', userName);

    await ozList.save();

    return res.status(200).json({message: 'List deleted', status: 200});
    
});

router.delete('/all', async (req, res) => {
    let cacheClient = getClient();

    let ozLogin = await cacheClient.hget('oz:data', 'login');
    
    let ozList = await listSchema.findOne({ name: ozLogin });

    if(ozList.list.length === 0) {
        return res.status(404).json({error: 'List not found', message: 'List is already empty', status: 404});
    }

    ozList.list = [];

    cacheClient.del('oz:list');

    await ozList.save();

    return res.status(200).json({message: 'List deleted', status: 200});
});

module.exports = router;