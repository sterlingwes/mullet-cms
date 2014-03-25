module.exports = function(db) {
    
    return {
        ContentType: db.schema('contentTypes', {
            fields: {
                name: {
                    type:   String,
                    safe:   true,
                    transform: ['toLowerCase']
                }
            }
        }),

        Content: db.schema('content', {
            fields: {
                owners: {
                    type:   [String],
                    safe:   true
                },
                parent: {
                    type:   String,
                    safe:   true
                },
                title: {
                    type:   String,
                    safe:   true
                },
                type: {
                    type:   String,
                    safe:   true,
                    transform: ['toLowerCase']
                },
                parts: {
                    type:   [Object],
                    safe:   true
                },
                created: {
                    type:   Date,
                    safe:   true
                },
                updated: {
                    type:   Date,
                    safe:   true
                }
            }
        }),

        LayoutType: db.schema('layoutTypes', {
            fields: {
                parent: {
                    type:   String,
                    safe:   true
                },
                type: {
                    type:   String,
                    safe:   true
                },
                parts: {
                    type:   [Object],
                    safe:   true
                }
            }
        }),

        TextType: db.schema('textTypes', {
            fields: {
                parent: {
                    type:   String,
                    safe:   true
                },
                index: {
                    type:   Number,
                    safe:   true
                },
                text: {
                    type:   String,
                    safe:   true
                }
            }
        })
    };    
};