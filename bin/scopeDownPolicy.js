module.exports.policy = {
    Version: "2012-10-17",
    Statement: [
        {
            Sid: "allowFolderList",
            Action: [
                "s3:ListBucket"
            ],
            Effect: "Allow",
            Resource: [
                "arn:aws:s3:::${transfer:HomeBucket}"
            ],
            Condition: {
                StringLike: {
                    "s3:prefix": [
                        "${transfer:UserName}/*"
                    ]
                }
            }
        },
        {
            Sid: "allowListBuckets",
            Effect: "Allow",
            Action: [
                "s3:ListAllMyBuckets",
                "s3:GetBucketLocation"
            ],
            Resource: "*"
        },
        {
            Sid: "HomeDirectoryAccess",
            Effect: "Allow",
            Action: [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObjectVersion",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            Resource: [
                "arn:aws:s3:::${transfer:HomeDirectory}/*"
            ]
        },
        {
            Sid: "DenyDeltionOfHomeDirectory",
            Effect: "Deny",
            Action: [
                "s3:DeleteObjectVersion",
                "s3:DeleteObject"
            ],
            Resource: [
                "arn:aws:s3:::${transfer:HomeDirectory}/"
            ]
        }
    ]
}