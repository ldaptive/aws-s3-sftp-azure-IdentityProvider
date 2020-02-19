const azure = require('./controllers/azure');
const policy = require('./bin/scopeDownPolicy').policy;

exports.handler = async (event) => {
    /** Getting our function environment Variables - these were set via the cloudformation stack */
    const bucket = process.env.S3BucketName;
    const s3Role = process.env.S3RoleArn;
    const domain = process.env.PrincipleDomain;
    const clientId = process.env.AzureClientId;
    const secret = process.env.AzureClientSecret;
    const grant = process.env.AzureGrantType;
    const groupId = process.env.AzureGroupMemberID;
    const userName = event.username.toLowerCase() + domain.toLowerCase();

    /** attempting to login user via API to get the Azure Tenant the user is a part of */
    var user = await azure.login(userName, event.password);
    if (!user.userId) {
        /** no user found returning from function and failing login via SFTP */
        return {};
    } else {
        /** We have a user - logging into tenant with app credentials to get our access token for Azure App */
        var appLogin = await azure.appLogin(user.tenantId, clientId, secret, grant);
        if (!appLogin.access_token) {
            /** No Access token recieved - Returning with to fail login via SFTP */
            return {};
        } else {
            /** Getting our member list from the supplied Azure AD group ID */
            var groupCheck = await azure.getGroupMembers(user.tenantId, groupId, appLogin.access_token);
            var member = false;
            /** validating our user is a member of the specified Azure AD Group */
            groupCheck.forEach(x => {
                if (x.toLowerCase() === userName) {
                    member = true;
                }
            });

            /** We have a group memeber - returning access via SFTP */
            if (member === true) {
                var response = {
                    Role: s3Role,
                    HomeBucket: bucket,
                    HomeDirectory: "/" + bucket + '/' + event.username.toLowerCase(),
                    Policy: JSON.stringify(policy)
                }
                return response;
            } else {
                return {}
            }
        }

    }
}
