const Resource = require('./resource');

function extractCuries(resource, links) {
    const curies = links.curies;
    for (let i = 0; i < curies.length; i++) {
        let linkRel = curies[i];
        const props = Object.keys(links);
        const filtrat = props.filter((key) => (key.indexOf(linkRel.name+':') === 0));
        for (let x = 0; x < filtrat.length; x++) {
            const affix = links[filtrat[x]].href.substr(1);
            resource.curie(linkRel.name, linkRel.href);
        }
    }
}

function extractResource(json) {
    // create root resource
    const root = new Resource();
    // loop through all links
    if(json.hasOwnProperty('_links') && json._links) {
        for (let prop in json._links) {
            if (json._links.hasOwnProperty(prop)) {
                if(prop === 'curies') {
                    extractCuries(root, json._links);
                }else {
                    root.link(prop, json._links[prop]);
                }
            }
        }
    }
    // loop through all embedded resources
    if(json.hasOwnProperty('_embedded') && json._embedded) {
        for (let prop in json._embedded) {
            if (json._embedded.hasOwnProperty(prop)) {
                if(Array.isArray(json._embedded[prop])) {
                    root.embed(prop, json._embedded[prop].map(extractResource));
                }else{
                    root.embed(prop, extractResource(json._embedded[prop]));
                }
            }
        }
    }
    // loop through other data properties
    for (let prop in json) {
        if (json.hasOwnProperty(prop) && prop !== '_links' && prop !== '_embedded') {
            let temp = {};
            temp[prop] = json[prop];
            root.state(temp)
        }
    }
    return root;
}

function validateResource(container) {
    const {rel, resource } = container;
    const warnings = [];
    const errors = [];
    const { links } = resource;
    if( links !== undefined ) {
        const selfLinks = links.filter((val) => val.rel === 'self');
        if(selfLinks.length === 0) {
            warnings.push({
                resourceRel: rel,
                title: 'missing self link',
                description: 'Each Resource Object SHOULD contain a self link.'
            });
        }

        const noHref = links.filter((val) => val.href === undefined);
        if(noHref.length > 0) {
            errors.push({
                resourceRel: rel,
                title: 'missing href in link',
                description: 'The "href" property is REQUIRED.'
            });
        }

        const curies = links.filter((val) => val.rel === 'curies');
        const noRelInHref = curies.filter((val) => {
            let result = val.href.indexOf('{rel}') === -1;
            return result;
        });
        if(noRelInHref.length > 0) {
            errors.push({
                resourceRel: rel,
                title: 'missing {rel} in url-template href',
                description: 'Curies url-templates MUST contain a {rel} token'
            });
        }
    }
    return {
        warnings,
        errors
    };
}

function flattenResourceTree(rel, resource) {
    let flatResourceTree = [{rel, resource}];
    if(!resource.hasOwnProperty('embedded') || resource.embedded.length === 0) {
        return flatResourceTree;
    }
    for (let i = 0; i < resource.embedded.length; i++) {
        flatResourceTree = flatResourceTree.concat(flattenResourceTree(resource.embedded[i].rel, resource.embedded[i].resource));
    }
    return flatResourceTree;
}

module.exports = {
    resource: (state) => {
        return new Resource(state);
    },

    fromJSON: (json) => {
        if(typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch (e) {
                throw new Error('valid JSON string or resource object expected');
            }
        }
        return extractResource(json);
    },

    isValidHAL: (resource) => {
        if(typeof json === 'string' ||  !(resource instanceof Resource)) {
            resource = module.exports.fromJSON(resource);
        }
        const flatResourceTree = flattenResourceTree('root', resource);
        return flatResourceTree.reduce((obj, val) => {
            const validationResult = validateResource(val);
            obj.warnings = obj.warnings.concat(validationResult.warnings);
            obj.errors = obj.errors.concat(validationResult.errors);
            return obj;
        }, {
            warnings: [],
            errors: []
        });
    },
};
