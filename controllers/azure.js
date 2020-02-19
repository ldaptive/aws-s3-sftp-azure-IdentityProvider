const msAuth = require('@azure/ms-rest-nodeauth').loginWithUsernamePasswordWithAuthResponse;
const request = require('request-promise-native');
const queryString = require('querystring');

/** handling our end user authentication via azure-sdk-for-js library (msAuth) */
module.exports.login = (username, password) => new Promise((resolve) => {
    msAuth(username, password).then((response) => {
        var user = {
            userId: response.credentials.tokenCache._entries[0].userId.toLowerCase(),
            samAcccountName: response.credentials.tokenCache._entries[0].userId.split('@')[0],
            tenantId: response.credentials.tokenCache._entries[0].tenantId,
            accessToken: response.credentials.tokenCache._entries[0].accessToken,
        }
        resolve(user);
    }).catch((err) => {
        console.log(err);
        resolve();
    });
});

/** handling our Azure Application authentication with using the grapsh rest api */
module.exports.appLogin = (tenentId, clientId, secret, grantType) => new Promise(async (resolve) => {
    var formData = queryString.stringify({
        client_id: clientId,
        client_secret: secret,
        grant_type: grantType
    });
    var options = {
        uri: "https://login.microsoftonline.com/" + tenentId + "/oauth2/token",
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    }
    var response = JSON.parse(await request(options));
    resolve(response);
});

/** getting our group membership from the graph api from the application token */
module.exports.getGroupMembers = (tenant, groupId, token) => new Promise(async (resolve, reject) => {
    var queryString = "api-version=1.6"
    var options = {
        uri: "https://graph.windows.net/" + tenant + "/groups/" + groupId + "?$expand=members&" + queryString,
        method: "get",
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    }
    var response = JSON.parse(await request(options));
    var members = [];
    response.members.forEach(x => {
        if (!members.includes(x.userPrincipalName.toLowerCase()));
        members.push(x.userPrincipalName.toLowerCase())
    });
    resolve(members);
});