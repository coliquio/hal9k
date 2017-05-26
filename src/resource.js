const Link = require('./link');

function sanitizeHalJSONObj(halJSON) {
    if (halJSON.hasOwnProperty('_links') && isEmptyObject(halJSON._links)) {
        delete halJSON._links;
    }
    if (halJSON.hasOwnProperty('_embedded') && isEmptyObject(halJSON._embedded)) {
        delete halJSON._embedded;
    }
    return halJSON;
}

function isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

class Resource {
    constructor(state) {
        this.links = [];
        this.embedded = [];
        this.properties = state || {};
    }

    link(rel, href, optionals) {
        if (arguments.length > 1 && typeof href === 'string') {
            const link = Object.assign({
                href
            }, optionals)
            this.links.push(new Link(rel, link));
        } else if (arguments.length == 2 && Array.isArray(href)) {
            for (let i = 0; i < href.length; i++) {
                this.links.push(new Link(rel, href[i]));
            }
        } else if (arguments.length == 2 && typeof href === 'object') {
            const link = Object.assign({}, href);
            this.links.push(new Link(rel, link));
        }
        return this;
    }

    linkTemplate(rel, href, optionals) {
        const link = Object.assign({
            href
        }, optionals, {
            templated: true
        })
        this.links.push(new Link(rel, link));
        return this;
    }

    curie(rel, urlTemplate) {
        this.links.push(new Link('curies', {
            name: rel,
            href: urlTemplate,
            templated: true
        }));
        return this;
    }

    embed(rel, resource) {
        this.embedded.push({
            rel,
            resource
        });
        return this;
    }

    state(properties) {
        Object.assign(this.properties, properties);
        return this;
    }

    toJSON() {
        const _embedded = this.embedded.reduce((obj, resource) => {
            if (Array.isArray(resource.resource)) {
                obj[resource.rel] = resource.resource.map(resource => resource.toJSON());
            } else {
                obj[resource.rel] = resource.resource.toJSON();
            }
            return obj;
        }, {});

        const _links = this.links.reduce((obj, link) => {
            if(link.rel === 'curies' && !obj.hasOwnProperty('curies')) {
                obj.curies = [];
            }

            if (!obj.hasOwnProperty(link.rel)) {
                obj[link.rel] = link.toJSON();
            } else if (Array.isArray(obj[link.rel])) {
                obj[link.rel].push(link.toJSON());
            } else if (typeof obj[link.rel] === 'object' &&
                obj[link.rel] !== null) {
                obj[link.rel] = [obj[link.rel], link.toJSON()];
            }
            return obj;
        }, {});

        const halJSON = Object.assign(this.properties, {
            _links,
            _embedded
        });
        return sanitizeHalJSONObj(halJSON);
    }


}

module.exports = Resource;
