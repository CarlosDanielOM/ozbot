require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getClient } = require('../../util/database/dragonfly');
const { getUserByToken } = require('../../functions/user/getuser');
const path = require('path');

const channelSchema = require('../../models/channel');
const listSchema = require('../../models/lists');

const viewRoutes = require('./routes/view.routes');
const listRoutes = require('./routes/list.routes');
const attendanceRoutes = require('./routes/attendance.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../routes/public')));

app.use('/view', viewRoutes);
app.use('/list', listRoutes);
app.use('/attendance', attendanceRoutes);

app.get('/', async (req, res) => {
    res.redirect('/view');
});

app.get('/auth/register', async (req, res) => {
    const token = req.query.code;
    const cacheClient = getClient();

    let params = new URLSearchParams();
    params.append('client_id', process.env.CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', token);
    params.append('redirect_uri', 'http://localhost:3000/login');
    
    let response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    let data = await response.json();

    if(data.status === 400) {
        console.error('Error getting token', data);
        return;
    }

    const { access_token, refresh_token } = data;

    let user = await getUserByToken(access_token);

    console.log({user});

    let userData = {
        id: user.id,
        login: user.login,
        name: user.display_name,
        token: access_token,
        refreshToken: refresh_token,
        email: user.email
    }

    let exists = await channelSchema.findOne({ user_id: user.id });

    if(!exists) {
        let newChannel = new channelSchema({
            login: user.login,
            name: user.display_name,
            email: user.email,
            user_id: user.id,
            user_token: access_token,
            user_refresh_token: refresh_token
        });

        let newList = new listSchema({
            name: user.login,
            list: []
        });
    
        await newChannel.save();
        await newList.save();
    }
    
    cacheClient.hset('oz:data', userData);
    
    res.redirect('/');
});

module.exports = app;